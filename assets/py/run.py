from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from time import sleep
from os import path, mkdir

from course_scraper import CourseScraper

SITE_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS'
DATA_PATH = "../../data"
LESSONS_FILE_NAME = "lesson_rows"


def create_driver():
    s = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=s)
    driver.minimize_window()
    return driver


def save_rows(rows):
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # Save each row to a different line.
    with open(f"{DATA_PATH}/{LESSONS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines([row + "\n" for row in rows])


if __name__ == "__main__":
    # Create the driver and open the site, then wait for it to be loaded.
    driver = create_driver()
    driver.get(SITE_URL)
    sleep(3)

    # Scrap and save the courses.
    course_scraper = CourseScraper(driver)
    rows = course_scraper.scrap_tables()
    save_rows(rows)

    driver.close()
