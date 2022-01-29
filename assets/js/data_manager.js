class DataManager {
    LESSON_PATH = "https://evrenge.github.io/ITU-yardimci/data/lesson_rows.txt";
    COURSE_PATH = "https://evrenge.github.io/ITU-yardimci/data/course_rows.txt";
    COURSE_PLAN_PATH = "https://evrenge.github.io/ITU-yardimci/data/course_plans.txt";

    constructor() {
        this._courses = [];
        this._semesters = {};
        this.coursesDict = {};

        this.fileLoadStatus = 0;
        this.onFileLoad = () => { };
    }

    get courses() {
        if (this._courses.length <= 0) {
            this.createCourses();
            this._courses.forEach(course => {
                this.coursesDict[course.courseCode] = course;
            });
            this.createLessons();
            this.connectAllCourses();
        }

        return this._courses;
    }

    get semesters() {
        if (Object.keys(this._semesters).length <= 0) {
            this.courses;
            this.createSemesters();
        }

        return this._semesters;
    }

    readAllTextFiles() {
        this.readTextFile(this.LESSON_PATH, (txt) => {
            this.lesson_lines = txt.split("\n");
            this.onFileLoadSuccess();
        });
        this.readTextFile(this.COURSE_PATH, (txt) => {
            this.course_lines = txt.split("\n");
            this.onFileLoadSuccess();
        });
        this.readTextFile(this.COURSE_PLAN_PATH, (txt) => {
            this.course_plan_lines = txt.split("\n");
            this.onFileLoadSuccess();
        });
    }

    onFileLoadSuccess() {
        this.fileLoadStatus++;
        if (this.fileLoadStatus >= 3)
            this.onFileLoad();
    }

    createCourses() {
        let lines = this.course_lines;
        this._courses = [];
        this.coursesDict = {};

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].replace("\r", "");
            if (line.length == 0) continue;

            let data = line.split("|");
            let course = new Course(data[0], data[1], data[2], data[3]);

            this._courses.push(course);
        }
    }

    createLessons() {
        let lines = this.lesson_lines;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].replace("\r", "");

            let data = line.split("|");
            let courseCode = data[1];
            let majorRest = data[9];
            let currentLesson = new Lesson(data[0], data[2], data[3], data[4],
                data[5], data[6], data[7], data[8]);

            let course = this.findCourseByCode(courseCode);

            course.lessons.push(currentLesson);
            course.majorRest = majorRest;
        }
    }

    connectAllCourses() {
        this._courses.forEach(course => {
            course.connectCourses();
        });
    }

    findCourseByCode(courseCode) {
        let course = this.coursesDict[courseCode];
        if (course == undefined) {
            course = new Course(courseCode, "Auto Generated Course", "", "");
            this._courses.push(course);
            this.coursesDict[courseCode] = course;
        }

        return course;
    }

    createSemesters() {
        let currentFaculty = "";
        let currentProgram = "";
        let currentIteration = "";
        let currentSemesters = [];
        this._semesters = [];

        let lines = this.course_plan_lines;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].replace("\r", "").trim();
            if (line.includes('# ')) {
                currentSemesters = [];
                let hashtagCount = line.split(' ')[0].length;
                let title = line.slice(hashtagCount + 1).trim();
                if (hashtagCount == 1) {
                    currentFaculty = title;
                    this._semesters[currentFaculty] = {};
                }
                if (hashtagCount == 2) {
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
                    // Course Group
                    if (course[0] === "[") {
                        course = course.replace("[", "").replace("]", "");
                        let courseGroupData = course.split("*");
                        courseGroupData[1] = courseGroupData[1].replace("(", "").replace(")", "");
                        let selectiveCourseNames = courseGroupData[1].split('|');
                        let selectiveCourses = [];
                        selectiveCourseNames.forEach(selectiveCourseName => {
                            selectiveCourses.push(this.findCourseByCode(selectiveCourseName));
                        });
                        semester.push(new CourseGroup(selectiveCourses, courseGroupData[0]));
                    }
                    // Course
                    else {
                        let courseObject = this.findCourseByCode(course);
                        semester.push(courseObject);
                    }
                }

                currentSemesters.push(semester);

                if (currentSemesters.length == 8)
                    this._semesters[currentFaculty][currentProgram][currentIteration] = currentSemesters;
            }
        }
    }

    readTextFile(path, onSuccess) {
        $.ajax({
            url: path,
            type: 'get',
            success: onSuccess,
        });
    }
}

var dataManager = new DataManager();