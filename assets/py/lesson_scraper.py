from selenium.webdriver.common.by import By
from tqdm import tqdm

from scraper import Scraper


class LessonScraper(Scraper):
    def scrap_current_table(self) -> list[list[str]]:
        rows = self.find_elements_by_tag("tr")

        # Filter out the header rows.
        return [row.get_attribute("outerHTML") for row in rows if row.get_attribute("class") != "table-baslik"]

    def generate_dropdown_options(self):
        # Clicking this generates dropdown options.
        self.find_elements_by_class("filter-option-inner-inner")[1].click()
        self.wait()

    def scrap_tables(self) -> list[list[str]]:
        def update_dropdown_refereces():
            self.generate_dropdown_options()

            return self.webdriver.find_elements(
                By.TAG_NAME, "li"), self.find_elements_by_class("button")[0]

        dropdown_options_parents, submit_button = update_dropdown_refereces()

        print("====== Scraping All Available Lessons ======")
        courses = []
        option_parent_tqdms = tqdm(range(71, len(dropdown_options_parents)))
        for i in option_parent_tqdms:
            dropdown_option = self.get_dropdown_option_if_available(
                dropdown_options_parents[i])
            if dropdown_option is None:
                continue

            course_name = dropdown_option.find_elements(By.TAG_NAME, "span")[
                0].get_attribute("innerHTML").strip()

            option_parent_tqdms.set_description(
                f"Scraping \"{course_name}\" lessons")

            self.wait_until_loaded(dropdown_option)

            dropdown_option.click()
            submit_button.click()
            self.wait()

            courses += self.scrap_current_table()
            dropdown_options_parents, submit_button = update_dropdown_refereces()

        return courses
