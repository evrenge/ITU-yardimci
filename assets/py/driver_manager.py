from lib2to3.pgen2.driver import Driver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from sys import platform


class DriverManager:

    DRIVER_WIN_PATH = "../webdrivers/chromedriver_win.exe"
    DRIVER_MAC_PATH = "../webdrivers/chromedriver_mac"
    DRIVER_LINUX_PATH = "../webdrivers/chromedriver_linux"

    @staticmethod
    def get_driver_path():
        if platform == "linux":
            return DriverManager.DRIVER_LINUX_PATH
        elif platform == "darwin":
            return DriverManager.DRIVER_MAC_PATH
        elif platform == "win32":
            return DriverManager.DRIVER_WIN_PATH

    @staticmethod
    def create_driver():
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
            options=chrome_options, executable_path=DriverManager.get_driver_path())
        return driver
