from selenium import webdriver
from time import sleep, perf_counter
from rich import print as rprint
from os import path, mkdir
from tqdm import tqdm

from driver_manager import DriverManager
from course_scraper import CourseScraper
from course_plan_scraper import CoursePlanScraper

LESSONS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS'
COURSE_PLANS_URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/lisans/ders-planlari/ders-planlari.php?fakulte='
DATA_PATH = "../../data"
LESSONS_FILE_NAME = "lesson_rows"
COURSE_PLANS_FILE_NAME = "course_plans"


def process_row(row):
    def extract_from_a(a):
        return a.split(">")[1].split("<")[0].strip()
    data = row.replace("<tr>", "").replace(
        "</tr>", "").replace("</td>", "").replace("<br>", "").replace("</br>", "").split("<td>")[1:]

    processed_row = data[0] + "|"  # CRN
    processed_row += extract_from_a(data[1]) + "|"  # Course Code
    processed_row += data[2] + "|"  # Course Title
    processed_row += data[3] + "|"  # Teaching Method
    processed_row += data[4] + "|"  # Instructor
    processed_row += extract_from_a(data[5]) + "|"  # Building
    processed_row += data[6] + "|"  # Day
    processed_row += data[7] + "|"  # Time
    processed_row += data[8] + "|"  # Room
    processed_row += data[9] + "|"  # Capacity
    processed_row += data[10] + "|"  # Enrolled
    processed_row += extract_from_a(data[12]) + "|"  # Major Rest.
    processed_row += data[13] + "|"  # Preq.
    processed_row += data[14]  # Class Rest.

    return processed_row


def save_rows(rows):
    print("====== Saving Lesson Rows ======")
    # Create the data folder if it does not exist.
    if not path.exists(DATA_PATH):
        mkdir(DATA_PATH)

    # Save each row to a different line.
    with open(f"{DATA_PATH}/{LESSONS_FILE_NAME}.txt", "w", encoding="utf-16") as f:
        f.writelines([process_row(row) + "\n" for row in rows])


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
    t0 = perf_counter()

    # Create the driver.
    driver = DriverManager.create_driver()

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

    t1 = perf_counter()
    rprint(
        f"Scraping & Saving Completed in [green]{round(t1 - t0, 2)}[white] seconds")

    driver.quit()
