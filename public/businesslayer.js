var datalayer = require("companydata");
const moment = require('moment');  // required for handling date and time

// Empty parameter check 
exports.checkEmptyParam = (paramVal, paramName) =>{
   var msg = null;
   
   // Check if length of the parameter is empty
   if(paramVal.trim().length == 0){
      msg =  paramName +" should not be empty";
   }
 
 return msg;
}


// Empty check for hire_date format
exports.checkHireDateFormat = (hire_date) =>{
   var msg = null;
   var regex = /^\d{4}-\d{2}-\d{2}$/; // regular expression in yyyy-MM-dd format

   if(hire_date.trim().length == 0 || !regex.test(hire_date)){
      msg =  "hire_date should be in yyyy-MM-dd format";
   }
 
 return msg;
}


// Validate duplicate Department Number
exports.validateDeptNo = (company, dept_no) => {
   var msg = null;

   // Get all departments
   const depts = datalayer.getAllDepartment(company);

   depts.forEach((dept)=>{

      // Check if duplicate department exist
      if(dept.getDeptNo() === dept_no){

        msg = "Duplicate entry " + dept_no + " for key 'dept_no'"; 
      }
   });   

   return msg;
}


// validate for non-existing department
exports.validateDeptId = (company, dept_id) => {
   var msg = null;

   const dept = datalayer.getDepartment(company, dept_id);
   
   // Check if no matching department found
   if(dept === null){
      msg = "No matching dept_id " + dept_id +" found";
   }

   return msg;
}


// validate mng_Id for existing employee
exports.validateMngId = (company, mng_id) => {
   var msg = null;

   const emps = datalayer.getAllEmployee(company);
   const emp = datalayer.getEmployee(mng_id);

   // Validate if no matching employee found for mng_id
   if(emps !== null){
      if(emp == null && mng_id !=0){
         msg = "No matching employee found for mng_Id " + mng_id;
      }
   }

   return msg;
}


// validate for duplicate employee
exports.validateEmpNo = (company, emp_no) => {
   var msg = null;

   // Get all employees
   const emps = datalayer.getAllEmployee(company);
   
   if(emps !== null){
      emps.forEach((emp) =>{

         // Validate for a duplicate emp_no
         if(emp.getEmpNo() === emp_no){
            msg = "Duplicate emp_no "+ emp_no + " found";
         }
      });
   }

   return msg;
}

// validate hire date
exports.validateHireDate = (hire_date) => {
   var msg = null;

   // Convert hireDate to yyyy-MM-dd format
   const hireDate = moment(hire_date).format("YYYY-MM-DD");

   // Declare a current date
   const currentDate = moment();
   
   // validate that hire_date should not be a future date
   if(moment(hireDate).isAfter(currentDate)){
      msg = "hire_date should not be a future date";
   }

   return msg;
}

// validate for week day
exports.validateWeekDay = (dateParam, dateName) => {
   var msg = null;

   // Extract the day full name
   const dayOfDate = moment(dateParam).format("dddd");
   
   // Check if day is Saturday or Sunday
   if(dayOfDate.toLowerCase() === "saturday" || dayOfDate.toLowerCase() === "sunday"){
      msg = dateName +" should not be a saturday or sunday";
   }

   return msg;
}

// validate for same emp_id and mng_id
exports.validateSameEmpMngId = (emp_id, mng_id) => {
   var msg = null;

   // check if emp_id and mng_id are same for the request
   if(emp_id === mng_id){
      msg = "mng_id should be different than the emp_id";
   }

   return msg;
}

// Empty check for start_date and end_date format
exports.checkDateTimeFormat = (timeParam, timeName) =>{
   var msg = null;
   var regex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/; // regular expression for yyyy-MM-dd HH:mm:ss format

   // Validate the format
   if(timeParam.trim().length == 0 || !regex.test(timeParam)){
      msg =  timeName + " should be in yyyy-MM-dd HH:mm:ss format";
   }
 
 return msg;
}


// validate for non-existing employee
exports.validateEmpId = (emp_id) => {
   var msg = null;

   const emp = datalayer.getEmployee(emp_id);

   // Check if emp_id is an existing id
   if(emp === null){
      msg = "No matching emp_id " + emp_id +" found";
   }

   return msg;
}


// compare start-time with current-time
exports.validateStartTime = (start_time) => {
   var msg = null;
   
   const startTime = moment(start_time, 'YYYY-MM-DD');

   const currentTime = moment();

   // Check if start_time is more than 7 days older or is after the current date
   if(currentTime.diff(startTime, 'days') > 7 || moment(startTime).isAfter(currentTime)){
      msg = "start_time should be upto a week older than current date";
   }

   return msg;
}


// compare start_time and end_time
exports.validateEndStartDiff = (start_time, end_time) => {
   var msg = null;

   const startTime = moment(start_time, "YYYY-MM-DD HH:mm:ss");
   const endTime = moment(end_time, "YYYY-MM-DD HH:mm:ss");
   
   // Validate if the difference between end_time and start_time is less than an hour
   if(endTime.diff(startTime) < 3600000 || 
      startTime.format('M') != endTime.format('M') || 
      startTime.format('D') != endTime.format('D') || 
      startTime.format('YYYY') != endTime.format('YYYY')){
         
      msg ="end_time should be atleast 1 hour greater than the start_time on same day";
   }

   return msg;
}


// check for start_time and end_time hours range 
exports.validateHours = (timeParam, timeVar) => {
   var msg = null;

   const time = moment(timeParam, "YYYY-MM-DD HH:mm:ss");
   const hour = time.format('H');
   const mins = time.format('mm');
   const secs = time.format('ss');

   // Validate if start_time or end_time is between 6AM to 6PM or not
   if((hour < 6) || 
      (hour >= 18 && !(hour == 18 && mins == 0 && secs == 0))){
      
      msg =  timeVar + " should be in between 06:00:00 and 18:00:00 inclusive";
   }
   return msg;
}

// check for the same start date
exports.validateSameStartDate = (emp_id, start_time) => {
   
   var msg = null;

   const startTime = moment(start_time, "YYYY-MM-DD");

   const timecards = datalayer.getAllTimecard(emp_id);

   timecards.forEach((timecard) =>{

      var formatTime = moment(timecard.getStartTime(), "YYYY-MM-DD");

      // Validate if any of the timecard is having the same start day
      if(formatTime.diff(startTime, 'days') == 0){
         msg = "Exiting record with same start day";
      }
   });

   return msg;
}