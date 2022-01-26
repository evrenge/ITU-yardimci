from selenium import webdriver
from time import sleep
from os import path, mkdir
from tqdm import tqdm
from create_driver import create_driver

from course_scraper import CourseScraper
from course_plan_scraper import CoursePlanScraper

LESSONS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS'
COURSE_PLANS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/lisans/ders-planlari/ders-planlari.php?fakulte='
DATA_PATH = "../../data"
LESSONS_FILE_NAME = "lesson_rows"
COURSE_PLANS_FILE_NAME = "course_plans"


def save_rows(rows):
    print("====== Saving Lesson Rows ======")
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # Save each row to a different line.
    with open(f"{DATA_PATH}/{LESSONS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines([row + "\n" for row in rows])


def save_course_plans(faculties):
    print("====== Saving Course Plans ======")
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # faculties dictionary is structure example:

    # faculties['İTÜ Kuzey Kıbrıs']['Deniz Ulaştırma İşletme Mühendisliği']
    # ['2014-2015 Güz ile 2015-2016 Güz Dönemleri Arası'] = [
    #     ['COM 101', 'PHE 101', ...],
    #     ['MST 102', 'NTH 102', ...],
    #     ['MST 221', 'MST 201', ..., {'Selective': ['HSS 201', 'MST 261', ...]},
    #     ....

    # Generate Lines
    lines = []
    faculties_tqdm = tqdm(faculties.keys())
    for faculty in faculties_tqdm:
        faculties_tqdm.set_description(f"Saving Course Plans of \"{faculty}\"")
        lines.append(f"# {faculty}\n")
        for faculty_plan in faculties[faculty].keys():
            lines.append(f"## {faculty_plan}\n")
            for faculty_plan_iter in faculties[faculty][faculty_plan]:
                lines.append(f"### {faculty_plan_iter}\n")
                for i, semester in enumerate(faculties[faculty][faculty_plan][faculty_plan_iter]):
                    lines.append(f"#### {i + 1}\n")
                    line = ""
                    for j, course in enumerate(semester):
                        if type(course) is dict:
                            for selective_course_title in course.keys():
                                line += f"[{selective_course_title}:("
                                for k, selective_course in enumerate(course[selective_course_title]):
                                    line += f"{selective_course}"

                                    if k != len(course[selective_course_title]) - 1:
                                        line += "-"
                                    else:
                                        line += ")]"
                        else:
                            line += course

                        if j != len(semester) - 1:
                            line += "-"

                    lines.append(line + "\n")

    # Save elines.
    with open(f"{DATA_PATH}/{COURSE_PLANS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines(lines)


if __name__ == "__main__":
    # Create the driver.
    driver = create_driver()

    # # Open the site, then wait for it to be loaded.
    # driver.get(LESSONS_URL)
    # sleep(3)

    # # Scrap and save the courses.
    # course_scraper = CourseScraper(driver)
    # rows = course_scraper.scrap_tables()
    # save_rows(rows)

    # print("")

    # Open the site, then wait for it to be loaded.
    driver.get(COURSE_PLANS_URL)
    sleep(3)

    # Scrap and save the courses.
    course_plan_scraper = CoursePlanScraper(driver)
    faculties = course_plan_scraper.scrap_course_plans()
    save_course_plans(faculties)

    driver.close()
