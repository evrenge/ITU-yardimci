from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from time import sleep
from os import path, mkdir

from course_scraper import CourseScraper
from course_plan_scraper import CoursePlanScraper

LESSONS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS'
COURSE_PLANS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/lisans/ders-planlari/ders-planlari.php?fakulte='
DATA_PATH = "../../data"
LESSONS_FILE_NAME = "lesson_rows"
COURSE_PLANS_FILE_NAME = "course_plans"


def create_driver():
    s = Service(ChromeDriverManager().install())

    chrome_options = Options()

    # chrome_options.add_argument("--disable-extensions")
    # chrome_options.add_argument("--disable-gpu")
    # chrome_options.add_argument("--no-sandbox") # linux only
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("log-level=2")

    driver = webdriver.Chrome(service=s, options=chrome_options)
    return driver


def save_rows(rows):
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # Save each row to a different line.
    with open(f"{DATA_PATH}/{LESSONS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines([row + "\n" for row in rows])


def save_course_plans(faculties):
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # Generate Lines
    lines = []
    for faculty in faculties.keys():
        lines.append(f"# {faculty}\n")
        for faculty_plan in faculties[faculty].keys():
            lines.append(f"## {faculty_plan}\n")
            for program in faculties[faculty][faculty_plan]:
                title, link = program.split("!")
                lines.append(f"### {title}\n")
                lines.append(f"{link}\n")

    # Save elines.
    with open(f"{DATA_PATH}/{COURSE_PLANS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines(lines)


if __name__ == "__main__":
    # Create the driver.
    driver = create_driver()

    # Open the site, then wait for it to be loaded.
    driver.get(LESSONS_URL)
    sleep(3)

    # Scrap and save the courses.
    course_scraper = CourseScraper(driver)
    rows = course_scraper.scrap_tables()
    save_rows(rows)

    print("")

    # Open the site, then wait for it to be loaded.
    driver.get(COURSE_PLANS_URL)
    sleep(3)

    # Scrap and save the courses.
    course_plan_scraper = CoursePlanScraper(driver)
    faculties = course_plan_scraper.scrap_course_plans()
    save_course_plans(faculties)

    driver.close()
