from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep


class Scraper:
    SLEEP_DUR = .05

    def __init__(self, driver: webdriver.Chrome) -> None:
        self.webdriver = driver

    def find_elements_by_class(self, class_name: str) -> list:
        return self.webdriver.find_elements(
            By.CLASS_NAME, class_name)

    def find_elements_by_tag(self, tag_name: str) -> list:
        return self.webdriver.find_elements(
            By.TAG_NAME, tag_name)

    def wait(self, mult: int = 1):
        sleep(self.SLEEP_DUR * mult)

    def wait_until_loaded(self, element, max_tries=500):
        for _ in range(max_tries):
            if element.is_displayed():
                break
            self.wait()

    def get_dropdown_option_if_available(self, option):
        if len(option.find_elements(By.TAG_NAME, "a")) <= 0:
            return None
        if option.find_elements(By.TAG_NAME, "a")[0].get_attribute("role") != "option":
            return None
        if "Seçiniz" in option.find_elements(By.TAG_NAME, "a")[0].get_attribute("innerHTML"):
            return None
        return option.find_elements(By.TAG_NAME, "a")[0]
