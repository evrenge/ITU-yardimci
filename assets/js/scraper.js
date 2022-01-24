
const URL = 'https://www.sis.itu.edu.tr/TR/ogrenci/ders-programi/ders-programi.php?seviye=LS';

function scrapAllCourses() {
    // Clicking this generates dropdown options.
    document.getElementsByClassName("filter-option-inner-inner")[1].click();

    let dropdown = document.getElementsByClassName("dropdown-menu inner ")[1];
    let dropdownOptions = dropdown.getElementsByClassName("text");

    let submitButton = document.getElementsByClassName("button")[0];

    let courses = [];
    for (let i = 0; i < dropdownOptions.length; i++) {
        let dropdownOption = dropdownOptions[i];

        dropdownOption.parentElement.click();
        submitButton.click();

        newCourses = scrapTable();
        courses = courses.concat(newCourses);
    }
}

function scrapTable() {
    let courses = [];
    let cachedCourseName = "-";
    let cachedCellArrays = [];

    let rows = document.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];

        // Skip the header rows.
        if (row.className == "table-baslik") continue;

        let cells = row.getElementsByTagName("td");
        let currentCourseName = cells[1].textContent;
        // If the course is the same.
        let isSameCourse = currentCourseName == cachedCourseName || cachedCourseName == "-";
        if (isSameCourse) {
            cachedCourseName = currentCourseName;
            cachedCellArrays.push(cells);
        }
        // If the course has changed.
        if (!isSameCourse || i == rows.length - 1) {
            // Save the previous cache.
            let lessons = [];
            for (let j = 0; j < cachedCellArrays.length; j++) {
                let cachedCellArray = cachedCellArrays[j];

                lessons.push(new Lesson(
                    cachedCellArray[0].textContent,
                    cachedCellArray[3].textContent,
                    cachedCellArray[4].textContent,
                    cachedCellArray[5].textContent,
                    cachedCellArray[6].textContent,
                    cachedCellArray[7].textContent,
                    cachedCellArray[8].textContent,
                    cachedCellArray[9].textContent,
                    cachedCellArray[10].textContent,
                ));
            }

            let course = new Course(
                cachedCellArrays[0][1].textContent,
                cachedCellArrays[0][2].textContent,
                cachedCellArrays[0][12].textContent,
                cachedCellArrays[0][13].outerHTML,
                cachedCellArrays[0][14].textContent,
                lessons);

            console.log(course);
            courses.push(course)

            // Create new cache.
            cachedCourseName = currentCourseName;
            cachedCellArrays = [cells];
        }
    }

    return courses;
}

scrapAllCourses();
