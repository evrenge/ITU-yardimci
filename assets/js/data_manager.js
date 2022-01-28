class DataManager {
    LESSON_PATH = "../../data/lesson_rows.txt";
    COURSE_PLAN_PATH = "../../data/course_plans.txt";

    constructor() {
        this._courses = [];
    }

    get courses() {
        if (this._courses.length <= 0) {
            this.createCourses();
            this.connectAllCourses();
        }

        return this._courses;
    }

    createCourses() {
        var lines = this.readTextFile(this.LESSON_PATH).split('\n');
        this._courses = [];
        let cachedCourseName = "-";
        let cachedLessonDataArray = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].replace("\r", "");

            let data = line.split("|");
            let currentCourseName = data[1];

            // If the lesson belongs to the same course.
            let isSameCourse = currentCourseName == cachedCourseName || cachedCourseName == "-";
            if (isSameCourse) {
                cachedCourseName = currentCourseName;
                cachedLessonDataArray.push(data);
            }
            // If the course has changed.
            if (!isSameCourse || i == lines.length - 1) {
                // Save the previous cache.
                let lessons = [];
                for (let j = 0; j < cachedLessonDataArray.length; j++) {
                    let cachedCellArray = cachedLessonDataArray[j];

                    lessons.push(new Lesson(
                        cachedCellArray[0],
                        cachedCellArray[3],
                        cachedCellArray[4],
                        cachedCellArray[5],
                        cachedCellArray[6],
                        cachedCellArray[7],
                        cachedCellArray[8],
                        cachedCellArray[9],
                        cachedCellArray[10],
                    ));
                }

                let course = new Course(
                    cachedLessonDataArray[0][1],
                    cachedLessonDataArray[0][2],
                    cachedLessonDataArray[0][11],
                    cachedLessonDataArray[0][12],
                    cachedLessonDataArray[0][13],
                    lessons);

                this._courses.push(course)

                // Create new cache.
                cachedCourseName = currentCourseName;
                cachedLessonDataArray = [data];
            }
        }
    }

    connectAllCourses() {
        this._courses.forEach(course => {
            course.connectCourses(this._courses);
        });
    }

    readTextFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        var allText = "";
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    allText = rawFile.responseText;
                }
            }
        }
        rawFile.send(null);
        return allText;
    }
}