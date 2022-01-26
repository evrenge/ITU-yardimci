import logging
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium import webdriver


class DriverManager:
    @staticmethod
    def create_driver():
        service = Service(ChromeDriverManager(
            log_level=logging.ERROR).install())

        chrome_options = Options()

        chrome_options.add_argument("--disable-extensions")
        # chrome_options.add_argument("--disable-gpu")
        # chrome_options.add_argument("--no-sandbox") # linux only
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("log-level=2")
        chrome_options.add_argument("--no-proxy-server")
        chrome_options.add_experimental_option(
            'excludeSwitches', ['enable-logging'])

        driver = webdriver.Chrome(
            service=service, options=chrome_options)
        return driver
