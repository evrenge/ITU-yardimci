class DataManager {
    LESSON_PATH = "../../data/lesson_rows.txt";
    COURSE_PLAN_PATH = "../../data/course_plans.txt";

    constructor() {
        this._courses = [];
        this._semesters = {};
    }

    get courses() {
        if (this._courses.length <= 0) {
            this.createCourses();
            this.connectAllCourses();
        }

        return this._courses;
    }

    get semesters() {
        if (Object.keys(this._semesters).length <= 0) {
            this.createSemesters();
        }

        return this._semesters;
    }

    createCourses() {
        let lines = this.readTextFile(this.LESSON_PATH);
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
        this._courses.forEach(course => course.connectCourses);
    }

    findCourseByCode(courseCode) {
        for (let i = 0; i < this.courses.length; i++) {
            const course = this.courses[i];
            if (course.courseCode === courseCode) {
                return course;
            }
        }
        return new Course(courseCode,"-", null, "", null, []);
    }

    createSemesters() {
        let currentFaculty = "";
        let currentProgram = "";
        let currentIteration = "";
        let currentSemesters = [];
        this._semesters = [];


        let lines = this.readTextFile(this.COURSE_PLAN_PATH);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].replace("\r", "").trim();
            if (line.includes('# ')) {
                currentSemesters = [];
                let hashtagCount = line.split(' ')[0].length;
                let title = line.slice(hashtagCount + 1).trim();
                if (hashtagCount == 1){
                    currentFaculty = title;
                    this._semesters[currentFaculty] = {};
                }
                if (hashtagCount == 2){
                    currentProgram = title;
                    this._semesters[currentFaculty][currentProgram] = {};
                }
                if (hashtagCount == 3)
                    currentIteration = title;
            }
            else {
                let semester = [];
                let courses = line.split('=');
                for (let j = 0; j < courses.length; j++) {
                    let course = courses[j];
                    // Course
                    if (course[0] !== "[") {
                        let courseObject = this.findCourseByCode(course);
                        semester.push(courseObject);
                    }
                    // Course Group
                    else {
                        course = course.replace("[", "").replace("]", "");
                        let courseGroupData = course.split(":");
                        courseGroupData[1] = courseGroupData[1].replace("(", "").replace(")", "");
                        let selectiveCourseNames = line.split('|');
                        let selectiveCourses = [];
                        selectiveCourseNames.forEach(selectiveCourseName => {
                            selectiveCourses.push(this.findCourseByCode(selectiveCourseName));
                        });
                        semester.push(new CourseGroup(selectiveCourses, courseGroupData[0]));
                    }
                }

                currentSemesters.push(semester);

                if (currentSemesters.length == 8)
                    this._semesters[currentFaculty][currentProgram][currentIteration] = currentSemesters;
            }
        }
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
        return allText.split('\n');
    }
}

var dataManager = new DataManager();