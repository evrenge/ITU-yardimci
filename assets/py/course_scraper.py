from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep
from tqdm import tqdm

SLEEP_DUR = .05


class CourseScraper:
    def __init__(self, driver: webdriver.Chrome) -> None:
        self.webdriver = driver

    def find_elements_by_class(self, class_name):
        return self.webdriver.find_elements(
            By.CLASS_NAME, class_name)

    def find_elements_by_tag(self, tag_name):
        return self.webdriver.find_elements(
            By.TAG_NAME, tag_name)

    def scrap_current_table(self) -> list[list[str]]:
        rows = self.find_elements_by_tag("tr")

        # Filter out the header rows.
        return [row.get_attribute("outerHTML") for row in rows if row.get_attribute("class") != "table-baslik"]

    def generate_dropdown_options(self):
        # Clicking this generates dropdown options.
        self.find_elements_by_class("filter-option-inner-inner")[1].click()
        sleep(SLEEP_DUR)

    def scrap_tables(self) -> list[list[str]]:
        def update_dropdown_refereces():
            self.generate_dropdown_options()

            return self.webdriver.find_elements(
                By.TAG_NAME, "li"), self.find_elements_by_class("button")[0]

        dropdown_options_parents, submit_button = update_dropdown_refereces()

        courses = []
        option_parent_tqdms = tqdm(range(71, len(dropdown_options_parents)))
        print("Scraping All Available Lessons...")
        for i in option_parent_tqdms:
            dropdown_option = dropdown_options_parents[i].find_elements(By.TAG_NAME, "a")[
                0]

            if dropdown_option is None:
                continue
            if dropdown_option.get_attribute("role") != "option":
                continue

            course_name = dropdown_option.find_elements(By.TAG_NAME, "span")[
                0].get_attribute("innerHTML")
            option_parent_tqdms.set_description(
                f"Scraping \"{course_name}\" lessons")

            for i in range(200):
                if dropdown_option.is_displayed():
                    break
                sleep(SLEEP_DUR)

            dropdown_option.click()
            submit_button.click()
            sleep(SLEEP_DUR)

            courses += self.scrap_current_table()
            dropdown_options_parents, submit_button = update_dropdown_refereces()

        return courses
