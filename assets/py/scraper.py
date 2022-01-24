from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep
from tqdm import tqdm

SLEEP_DUR = .05


class Scraper:
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

        dropdownOptionsParents, submitButton = update_dropdown_refereces()

        courses = []
        for i in tqdm(range(71, len(dropdownOptionsParents))):
            dropdownOption = dropdownOptionsParents[i].find_elements(By.TAG_NAME, "a")[
                0]

            if dropdownOption is None:
                continue
            if dropdownOption.get_attribute("role") != "option":
                continue

            for i in range(200):
                if dropdownOption.is_displayed():
                    break
                sleep(SLEEP_DUR)

            dropdownOption.click()
            submitButton.click()
            sleep(SLEEP_DUR)

            courses += self.scrap_current_table()
            dropdownOptionsParents, submitButton = update_dropdown_refereces()

        return courses
