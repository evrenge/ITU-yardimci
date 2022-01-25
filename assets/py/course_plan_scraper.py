from multiprocessing.connection import wait
from scraper import Scraper
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from tqdm import tqdm


class CoursePlanScraper(Scraper):
    def generate_dropdown_options_faculty(self):
        # Check if the dropdown is already expanded.
        dropdown = self.find_elements_by_tag("button")[0]
        if dropdown.get_attribute("aria-expanded") == "true":
            return

        # Clicking this generates dropdown options.
        self.find_elements_by_class("filter-option-inner-inner")[0].click()
        self.wait()

    def generate_dropdown_options_program(self):
        # Check if the dropdown is already expanded.
        dropdown = self.find_elements_by_tag("button")[1]
        if dropdown.get_attribute("aria-expanded") == "true":
            return

        # Clicking this generates dropdown options.
        self.find_elements_by_class("filter-option-inner-inner")[1].click()
        self.wait()

    def get_submit_button(self):
        return self.find_elements_by_class("button")[0]

    def scrap_programs(self):
        programs = []
        for a in self.find_elements_by_tag("a"):
            href = a.get_attribute("href")
            inner_part = a.get_attribute("innerHTML")
            if ".html" in href:
                programs.append(f"{inner_part}!{href}")

        return programs

    course_plans = dict()

    def scrap_course_plans(self):
        def get_faculty_dropdown_options():
            self.generate_dropdown_options_faculty()
            return self.find_elements_by_tag("li")[69:]

        faculties = dict()
        print("====== Scraping Course Programs ======")
        faculty_dropdown_opts_tqdm = tqdm(
            range(len(get_faculty_dropdown_options())))
        for i in faculty_dropdown_opts_tqdm:
            faculty_dropdown_option = get_faculty_dropdown_options()[i]
            faculty = self.get_dropdown_option_if_available(
                faculty_dropdown_option)
            if faculty is None:
                continue

            faculty_name = faculty_dropdown_option.find_element(
                By.TAG_NAME, "span").get_attribute("innerHTML")

            faculty_dropdown_opts_tqdm.set_description(
                f"Scraping \"{faculty_name}\" programs")

            # self.wait_until_loaded(faculty)
            ActionChains(self.webdriver).move_to_element(
                faculty).click(faculty).perform()

            def get_program_dropdown_options():
                self.generate_dropdown_options_program()
                return self.find_elements_by_tag("li")

            programs = dict()
            for j in range(len(get_program_dropdown_options())):
                program_dropdown_option = get_program_dropdown_options()[j]
                program = self.get_dropdown_option_if_available(
                    program_dropdown_option)
                if program is None:
                    continue

                program_name = program_dropdown_option.find_element(
                    By.TAG_NAME, "span").get_attribute("innerHTML")

                # self.wait_until_loaded(program)
                ActionChains(self.webdriver).move_to_element(
                    program).click(program).perform()

                self.get_submit_button().click()
                self.wait()

                programs[program_name] = self.scrap_programs()

                self.webdriver.back()
            faculties[faculty_name] = programs
            self.webdriver.back()

        return faculties
