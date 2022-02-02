from math import ceil
from scraper import Scraper
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
import threading
from driver_manager import DriverManager
from time import perf_counter
from rich import print as rprint


class CoursePlanScraper(Scraper):
    MAX_FACULTY_THREADS = 8

    def generate_dropdown_options_faculty(self, driver):
        # Check if the dropdown is already expanded.
        dropdown = driver.find_elements(By.TAG_NAME, "button")[0]
        if dropdown.get_attribute("aria-expanded") == "true":
            return

        # Clicking this generates dropdown options.
        driver.find_elements(
            By.CLASS_NAME, "filter-option-inner-inner")[0].click()
        self.wait()

    def generate_dropdown_options_program(self, driver):
        # Check if the dropdown is already expanded.
        dropdown = driver.find_elements(By.TAG_NAME, "button")[1]
        if dropdown.get_attribute("aria-expanded") == "true":
            return

        # Clicking this generates dropdown options.
        driver.find_elements(
            By.CLASS_NAME, "filter-option-inner-inner")[1].click()
        self.wait()

    def get_submit_button(self):
        return self.find_elements_by_class("button")[0]

    def scrape_program(self, url, driver):
        # Scrap the program iterations
        driver.get(url)

        def get_tables():
            return [table for i, table in enumerate(driver.find_elements(By.CLASS_NAME, "table-responsive")) if i % 2 != 0]

        program_list = []
        tables = get_tables()
        for i in range(len(tables)):
            semester_program = []

            def get_rows(trial_count=0):
                tables = get_tables()
                if len(tables) == 0 and trial_count < 50:
                    self.wait()
                    return get_rows(trial_count + 1)

                # First row is just the header.
                return tables[i].find_elements(By.TAG_NAME, "tr")[1:]

            rows = get_rows()
            for j in range(len(rows)):
                cells = get_rows()[j].find_elements(By.TAG_NAME, "td")

                # If the course is selective.
                if cells[0].get_attribute("innerHTML") == "&nbsp;":
                    a = cells[1].find_element(By.TAG_NAME, "a")
                    selective_courses_url = a.get_attribute("href")
                    selective_courses_title = a.get_attribute("innerHTML")

                    driver.get(selective_courses_url)

                    selective_courses = []
                    selective_course_tables = driver.find_elements(By.CLASS_NAME,
                                                                   "table-responsive")
                    if len(selective_course_tables) > 0:
                        selective_course_rows = selective_course_tables[0].find_elements(
                            By.TAG_NAME, "tr")
                        # First row is just the header.
                        for row in selective_course_rows[1:]:
                            selective_courses.append(row.find_elements(By.TAG_NAME, "a")[
                                0].get_attribute("innerHTML"))
                    semester_program.append(
                        {selective_courses_title: selective_courses})
                    driver.back()

                    rows = get_rows()
                    tables = get_tables()
                else:
                    course_code = cells[0].find_element(
                        By.TAG_NAME, "a").get_attribute("innerHTML")
                    semester_program.append(course_code)

            program_list.append(semester_program)

        return program_list

    def scrap_programs(self, driver, program_name):
        program_iterations = dict()
        start_url = driver.current_url

        # Cache the urls for the program iterations.
        for a in driver.find_elements(By.TAG_NAME, "a"):
            url = a.get_attribute("href")
            inner_part = a.get_attribute("innerHTML")
            if ".html" in url:
                program_iterations[inner_part] = url

        threads = []

        def scrap_program_and_save(key, url):
            try:
                driver = DriverManager.create_driver()
                program_iterations[key] = self.scrape_program(url, driver)
                driver.quit()
            except Exception:
                rprint(
                    f"[bold red]Error was thrown while scraping a program iteration of [cyan]\"{program_name}\"[bold red]: retrying...")
                scrap_program_and_save(key, url)

        for program_iteration, url in program_iterations.items():
            threads.append(threading.Thread(
                target=scrap_program_and_save, args=(program_iteration, url)))

        for t in threads:
            t.start()

        for t in threads:
            t.join()

        driver.get(start_url)
        return program_iterations

    def scrap_course_plan(self, i, url):
        driver = DriverManager.create_driver()
        driver.get(url)

        def get_faculty_dropdown_options():
            self.generate_dropdown_options_faculty(driver)
            return driver.find_elements(By.TAG_NAME, "li")[69:]

        faculty_dropdown_option = get_faculty_dropdown_options()[i]
        faculty = self.get_dropdown_option_if_available(
            faculty_dropdown_option)
        if faculty is None:
            driver.quit()
            return

        faculty_name = faculty_dropdown_option.find_element(
            By.TAG_NAME, "span").get_attribute("innerHTML")

        ActionChains(driver).move_to_element(
            faculty).click(faculty).perform()

        def get_program_dropdown_options():
            self.generate_dropdown_options_program(driver)
            return driver.find_elements(By.TAG_NAME, "li")

        faculty_plans = dict()
        for j in range(len(get_program_dropdown_options())):
            program_dropdown_option = get_program_dropdown_options()[j]
            program = self.get_dropdown_option_if_available(
                program_dropdown_option)
            if program is None:
                continue

            program_name = program_dropdown_option.find_element(
                By.TAG_NAME, "span").get_attribute("innerHTML")

            ActionChains(driver).move_to_element(
                program).click(program).perform()

            driver.find_elements(By.CLASS_NAME, "button")[0].click()
            self.wait()

            faculty_plans[program_name] = self.scrap_programs(
                driver, program_name)

            rprint(
                f"[white]Finished Scraping The Program: [cyan]\"{program_name}\"[white] Under the Faculty: [bold red]\"{faculty_name}\"")
            driver.back()

        driver.quit()
        rprint(
            f"[white]Finished Scraping The Faculty: [bold red]\"{faculty_name}\"")
        self.faculties[faculty_name] = faculty_plans

    def scrap_course_plans(self):
        def get_faculty_dropdown_options():
            self.generate_dropdown_options_faculty(self.webdriver)
            return self.find_elements_by_tag("li")[69:85]

        faculty_order = [x.find_element(By.TAG_NAME, "span").get_attribute("innerHTML")
                         for x in get_faculty_dropdown_options()]

        t0 = perf_counter()
        self.faculties = dict()
        print("====== Scraping Course Programs ======")
        faculty_count = len(get_faculty_dropdown_options())
        for j in range(ceil(faculty_count / self.MAX_FACULTY_THREADS)):
            rprint(f"[bold green]Refreshed:[green] Faculty Threads")
            threads = []
            for i in range(self.MAX_FACULTY_THREADS):
                current_index = i + j * self.MAX_FACULTY_THREADS
                if current_index >= faculty_count:
                    break

                threads.append(threading.Thread(
                    target=self.scrap_course_plan, args=(current_index, self.webdriver.current_url)))

            for t in threads:
                t.start()

            for t in threads:
                t.join()
            rprint(
                f"[bold green]Threads Finished:[green] Thread {0 + j * self.MAX_FACULTY_THREADS} - {(j + 1) * self.MAX_FACULTY_THREADS}")

        t1 = perf_counter()
        rprint(
            f"Scraping Course Plans Completed in [green]{round(t1 - t0, 2)}[white] seconds.")
        return self.faculties, faculty_order
