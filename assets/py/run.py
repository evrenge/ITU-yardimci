from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from time import sleep

from scraper import Scraper

SITE_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS'


def create_driver():
    s = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=s)
    driver.minimize_window()
    return driver


if __name__ == "__main__":
    driver = create_driver()
    driver.get(SITE_URL)
    sleep(3)

    scraper = Scraper(driver)
    rows = scraper.scrap_tables()

    with open("../../data/lesson_rows.txt", "w", encoding="utf-16") as f:
        f.writelines([row + "\n" for row in rows])

    driver.close()
