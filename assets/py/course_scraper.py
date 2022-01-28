from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from tqdm import tqdm

from scraper import Scraper


class CourseScraper(Scraper):
    def scrap_current_table(self):
        rows = self.find_elements_by_tag("tr")

        # Filter out the header rows.
        return [row.get_attribute("outerHTML") for row in rows if row.get_attribute("class") != "table-baslik"]

    def scrap_tables(self):
        def get_submit_button():
            return self.find_elements_by_class("project__filter")[0].find_elements(By.TAG_NAME, "input")[1]

        def get_dropdown_options():
            # Expand the dropdown.
            expand_button = self.find_elements_by_tag("button")[0]
            if expand_button.get_attribute("aria-expanded") == "false":
                ActionChains(self.webdriver).move_to_element(
                    expand_button).click(expand_button).perform()

            # First index is the "Select something" option
            return self.find_elements_by_tag("ul")[14].find_elements(By.TAG_NAME, "li")[1:]

        print("====== Scraping All Courses ======")
        courses = []
        option_parent_tqdms = tqdm(range(len(get_dropdown_options())))
        for i in option_parent_tqdms:
            dropdown_option = get_dropdown_options()[i]

            course_name = dropdown_option.find_elements(By.TAG_NAME, "span")[
                0].get_attribute("innerHTML").strip()

            option_parent_tqdms.set_description(
                f"Scraping \"{course_name}\" courses")

            self.wait_until_loaded(dropdown_option)

            dropdown_option = dropdown_option.find_element(By.TAG_NAME, "a")
            ActionChains(self.webdriver).move_to_element(
                dropdown_option).click(dropdown_option).perform()

            get_submit_button().click()
            self.wait()

            courses += self.scrap_current_table()

        return courses
