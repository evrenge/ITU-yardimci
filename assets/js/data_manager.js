class DataManager{
    LESSON_PATH = "../../data/lesson_rows.txt";
    CLASS_PATH = "../../data/course_plans.txt";

    constructor(){
        this.initialisedLessons = false;
        this.initialisedClasses = false;
    }

    readCourses(){
        const fs = require('fs')
        fs.readFile(LESSON_PATH, (err, data) => {
            if (err) throw err;
            this.courses = this.generateCoursesArray(data.toString());
        })
    }

    readClass(){
        if(!this.initialisedClasses) return;

        const fs = require('fs')
        fs.readFile(CLASS_PATH, (err, data) => {
            if (err) throw err;
            this.classData = data.toString();
            this.initialisedClasses = true;
        })

    }

    generateCoursesArray(lines) {
        let courses = [];
        let cachedCourseName = "-";
        let cachedCellArrays = [];
    
        let rows = lines.split("\n");
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

}

class FacultyProgram{
    constructor(name, iterations){
        this.name = name;
        //this.iterations = iterations;
    }


}