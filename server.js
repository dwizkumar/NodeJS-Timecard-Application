var datalayer = require("companydata");
var Department = require("companydata").Department;
var Employee = require("companydata").Employee;
var Timecard = require("companydata").Timecard;
var validate = require("./public/businesslayer");

const express = require( "express" ),
      app = express(),
      
      bodyParser = require("body-parser"), // for form data in POST request 
                                           // when extended = false, create object is 
                                           // array or object only
      urlEncodedParser = bodyParser.urlencoded({extended: false}),
      jsonParser = bodyParser.json(),
      base = express.Router(),
      
      server = app.listen( 8080, () => {
        const host =  server.address().address,
              port = server.address().port;
        console.log( "App listening at http://%s:%s", host, port );
      });
 
app.use(express.json()),
app.use(express.urlencoded({extended:false})),
app.use('/CompanyServices', base);


var default_company = "dxk3754";

// Delete company: Method deletes all Department, Employee, Timecard records of requested company
base.delete("/company" , (req, res)=>{
    try{
        
        // Validate for empty company name 
        const companyName = validate.checkEmptyParam(req.query.company, "company");
        
        if(companyName !== null)
            throw companyName;

        // Delete company    
        const response = datalayer.deleteCompany(req.query.company);
        
        // Check if company information deleted successfully
        if(response>=1){
        
        var msg = { success: "companyName's information deleted."}    
        }
        else{
        var msg = { error: "companyName's information not found."}       
        }
        
        // Return json response
        res.status(200).type("json").send(JSON.stringify(msg));
    }
    catch(err){
        // Catch if any error exists
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



//Get Department: Method returns particular Department for the requested company and department id
base.get("/department" , (req, res)=>{
    try{
        
        // Empty check for company name
        const companyName = validate.checkEmptyParam(req.query.company, "company");
    
        if(companyName !== null)
            throw companyName;

        // Empty check for dept_id    
        const deptId = validate.checkEmptyParam(req.query.dept_id, "dept_id");    
        
        if(deptId !== null)
            throw deptId;

        // Get the Department    
        const response = datalayer.getDepartment(req.query.company, req.query.dept_id);

        // Check if the requested Department not present 
        if(response == null)
            throw "No department found for dept_id "+ req.query.dept_id;

        // Success response    
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch the error if present
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});


// Get all Departments: Method returns all departments for the requested company
base.get("/departments" , (req, res)=>{

    try{
        // Check for empty company name
        const companyName = validate.checkEmptyParam(req.query.company, "company");
    
        if(companyName !== null)
            throw companyName;

        // Get a list of Departments    
        const response = datalayer.getAllDepartment(req.query.company);

        // Check if the Department list is empty 
        if(response === undefined || response.length == 0)
            throw "No department found for the company "+ req.query.company;
        
        // Success response with a list of Department
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch all errors
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Insert a Department: Method inserts a new Department record and return the inserted Department record
base.post("/department" ,  (req, res)=>{
    try{
        // Check for the empty company name
        const companyName = validate.checkEmptyParam(req.body.company, "company");
    
        if(companyName !== null)
            throw companyName;
        
        // Check for the empty department name     
        const deptName = validate.checkEmptyParam(req.body.dept_name, "dept_name");
    
        if(deptName !== null)
            throw deptName;
        
        // Check for the empty department number    
        const deptNo = validate.checkEmptyParam(req.body.dept_no, "dept_no");    
            
        if(deptNo !== null)
            throw deptNo;

        // Check for the empty location    
        const location = validate.checkEmptyParam(req.body.location, "location");    
            
        if(location !== null)
            throw location;        
        
        // Validate for duplicate dept_no entry    
        const validDeptNo = validate.validateDeptNo(req.body.company, req.body.dept_no);            

        if(validDeptNo !== null)
            throw validDeptNo;        
        
        // Insert Department    
        const response =  datalayer.insertDepartment(req.body);

        if(response== null){
            
            var msg = {error: "Error in processing request"}
            
            // Error response
            res.status(200).type("json").send(msg);
        }else{
            
            // Sucessful response
            const jsonResp = {success: response};

            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
    }
    catch(err){
        // Catch Error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Update a Department: Method inserts a new Department record and return the updated Department record
base.put("/department" , (req, res)=>{
    try{
        // Check for the empty dept_id
        const deptId = validate.checkEmptyParam(req.body.dept_id, "dept_id");    
        
        if(deptId !== null)
            throw deptId;

        if((req.body.dept_no !== null) && (req.body.dept_no !== undefined)){
            // Check for a duplicate dept_no
            const validDeptNo = validate.validateDeptNo(default_company, req.body.dept_no);            

            if(validDeptNo !== null)
                throw validDeptNo;
        }

        // Check for the existing dept_id
        const validDeptId = validate.validateDeptId(default_company, req.body.dept_id);
        
        if(validDeptId !== null)
            throw validDeptId;
        
        // Get the department    
        const dept = datalayer.getDepartment(default_company, req.body.dept_id);
        
        if(dept != null){
            // Set the requested values
            if((req.body.company !== null) && (req.body.company !== undefined)){
                dept.setCompany(req.body.company);
            }
            if((req.body.dept_name !== null) && (req.body.dept_name !== undefined)){
                dept.setDeptName(req.body.dept_name);
            }
            if((req.body.dept_no !== null) && (req.body.dept_no !== undefined)){
                dept.setDeptNo(req.body.dept_no);
            }
            if((req.body.location !== null) && (req.body.location !== undefined)){
                dept.setLocation(req.body.location);
            }
            
        // Update the Department
            const  response = datalayer.updateDepartment(dept);

            const jsonResp = {success: response};

            // Success response
            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
    }
    catch(err){

        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Delete a Department: Method deletes a Department of a requested company and Department id
base.delete("/department" , (req, res)=>{
    try{
        
        // Empty check for the company name
        const companyName = validate.checkEmptyParam(req.query.company, "company");
    
        if(companyName !== null)
            throw companyName;

        // Empty check for the dept_id    
        const deptId = validate.checkEmptyParam(req.query.dept_id, "dept_id");    
        
        if(deptId !== null)
            throw deptId;

        // Get all employees    
        const emps = datalayer.getAllEmployee(req.query.company);
        
        if((emps !== null) && (emps !== undefined)){
            
            emps.forEach((emp)=>{
                // loop through each of the Department id to match dept_id
                if(emp.getDeptId() === parseInt(req.query.dept_id)){
                    
                    // Get all timecards for the employee
                    const times = datalayer.getAllTimecard(emp.getId());
                    
                    if((times !== null) && (times !== undefined)){
                        
                        times.forEach((time)=>{
                            // loop through each timecard and delete it
                            datalayer.deleteTimecard(time.getId());
                            
                        });
                    }
                    // After timecard, delete all employees
                    datalayer.deleteEmployee(emp.getId());
                }
            });
        }
        
        // Finally delete the department
        const  response = datalayer.deleteDepartment(req.query.company,req.query.dept_id);
        
        // Check if department is successfully deleted
        if(response >= 1){
            // Success response
            var msg = {success: "Department " + req.query.dept_id + " from " + req.query.company + " deleted."}
            
        }else{
            // Error response
            var msg = {error: "Department " + req.query.dept_id + " from " + req.query.company + " does not exist."}
        }
        res.status(200).type("json").send(JSON.stringify(msg));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Get Employee: Method returns a particular Employee record of the matching Employee id
base.get("/employee" , (req, res)=>{
    
    try{
        // Check for the empty employee id
        const empId = validate.checkEmptyParam(req.query.emp_id, "emp_id");
        
        if(empId !== null)
            throw empId;

        // Get employee     
        const response = datalayer.getEmployee(req.query.emp_id);

        // If no employee found
        if(response == null)
            throw "No employee found for emp_id "+ req.query.emp_id;
        
        // Scuccess response
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Get all Employees: Method returns a list of employees for the specific company
base.get("/employees" , (req, res)=>{
    
    try{

        // Check for the empty company name
        const companyName = validate.checkEmptyParam(req.query.company, "company");
        
        if(companyName !== null)
            throw companyName;

        // Get all employees    
        const response = datalayer.getAllEmployee(req.query.company);
        
        // Validate for empty employee list
        if(response === undefined || response.length == 0)
            throw "No employee found for the company "+ req.query.company;

        // Scuccess response    
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Insert an Employee: Method insert a new Employee record and returns the inserted record
base.post("/employee" ,  (req, res)=>{
    try{
        // Check for the empty emp_name
        const empName = validate.checkEmptyParam(req.body.emp_name, "emp_name");
        
        if(empName !== null)
            throw empName;
        
        // Check for the empty emp_no
        const empNo = validate.checkEmptyParam(req.body.emp_no, "emp_no");
        
        if(empNo !== null)
            throw empNo;
        
        // Check for the empty hire date
        const hireDate = validate.checkHireDateFormat(req.body.hire_date);
        
        if(hireDate !== null)
            throw hireDate;     
        
        // Check for the empty     
        const job = validate.checkEmptyParam(req.body.job, "job");
        
        if(job !== null)
            throw job;  
        
        // validate for the existance of dept_id    
        const validDeptId = validate.validateDeptId(default_company, req.body.dept_id);
        
        if(validDeptId !== null)
            throw validDeptId;
        
        // Check if mng_id is an existing emp_id    
        const validMngId = validate.validateMngId(default_company, req.body.mng_id);
        
        if(validMngId !== null)
            throw validMngId;

        // Check for the duplicate emp_no    
        const validEmpNo =  validate.validateEmpNo(default_company, req.body.emp_no);
        
        if(validEmpNo !== null)
            throw validEmpNo;

        // validate hire_date for current date or before date     
        const validHireDate = validate.validateHireDate(req.body.hire_date);
        
        if(validHireDate !== null)
            throw validHireDate;
        
        // Check for the Saturday or Sunday    
        const validWeekDay = validate.validateWeekDay(req.body.hire_date, "hire_date");
        
        if(validWeekDay !== null)
            throw validWeekDay;

        // Insert employee    
        const response =  datalayer.insertEmployee(req.body);
        
        if(response== null){
            // Error response
            var msg = {error: "Error in processing."}
            
            res.status(200).type("json").send(msg);
        }else{
            // Success response
            const jsonResp = {success: response};
            
            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Update an Employee: Method updates the existing employee record and returns the updated Employee
base.put("/employee" , (req, res)=>{
    
    try{
        // Check for the empty emp_id
        const empId = validate.checkEmptyParam(req.body.emp_id, "emp_id");
        
        if(empId !== null)
            throw empId;

        // Get the existing employee record    
        const emp = datalayer.getEmployee(req.body.emp_id);

        if(emp != null){                

            // Set the requested fields
            if((req.body.dept_id !== null) && (req.body.dept_id !== undefined)){

                // Check for the existing dept_id 
                const validDeptId = validate.validateDeptId(default_company, req.body.dept_id);
                
                if(validDeptId !== null)
                    throw validDeptId;
    
                emp.setDeptId(req.body.dept_id);
            }
            if((req.body.mng_id !== null) && (req.body.mng_id !== undefined)){
                // Check if mng_id is an existing employee
                const validMngId = validate.validateMngId(default_company, req.body.mng_id);
        
                if(validMngId !== null)
                    throw validMngId;

                // Validate the emp_id and mng_id not same in the request    
                const validEmpMngId = validate.validateSameEmpMngId(req.body.emp_id, req.body.mng_id);
                
                if(validEmpMngId !== null)
                    throw validEmpMngId;

                emp.setMngId(req.body.mng_id);
            }
            if((req.body.emp_no !== null) && (req.body.emp_no !== undefined)){
                
                // Check for the existing emp_no
                const validEmpNo =  validate.validateEmpNo(default_company, req.body.emp_no);

                if(validEmpNo !== null)
                    throw validEmpNo;

                emp.setEmpNo(req.body.emp_no);
            }    
            if((req.body.hire_date !== null) && (req.body.hire_date !== undefined)){

                // Check for the hire_date format(YYYY-MM-DD)
                const hireDate = validate.checkHireDateFormat(req.body.hire_date);
        
                if(hireDate !== null)
                    throw hireDate; 
                
                // Validate that hire_date should not be a future date    
                const validHireDate = validate.validateHireDate(req.body.hire_date);
        
                if(validHireDate !== null)
                    throw validHireDate;

                // Check for hire_date as Saturday or Sunday    
                const validWeekDay = validate.validateWeekDay(req.body.hire_date, "hire_date");
        
                if(validWeekDay !== null)
                    throw validWeekDay;
                
                emp.setHireDate(req.body.hire_date);
            }
            if((req.body.emp_name !== null) && (req.body.emp_name !== undefined)){
                emp.setEmpName(req.body.emp_name);
            }
            if((req.body.job !== null) && (req.body.job !== undefined)){
                emp.setJob(req.body.job);
            }
            if((req.body.salary !== null) && (req.body.salary !== undefined)){
                emp.setSalary(req.body.salary);
            }
            
            // Update employee record
            const  response = datalayer.updateEmployee(emp);

            const jsonResp = {success: response};
            
            // Success response
            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
        else{
            // error response
            var msg = {error: "No matching employee found for the emp_id " + req.body.emp_id}

            res.status(200).type("json").send(JSON.stringify(msg));
        }
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Delete Employee: Method deletes the existing Employee record based on the requested Employee id
base.delete("/employee" , (req, res)=>{
    try{
        // Check for the empty emp_id
        const empId = validate.checkEmptyParam(req.query.emp_id, "emp_id");    
        
        if(empId !== null)
            throw empId;

        // Fetch all timecards for the employee    
        const timecards = datalayer.getAllTimecard(req.query.emp_id);
        
        if((timecards !== null) && (timecards !== undefined)){
            
            timecards.forEach((timecard)=>{
                // Delete each timecard
                datalayer.deleteTimecard(timecard.getId());

            });
        }
        
        // Delete employee
        const  response = datalayer.deleteEmployee(req.query.emp_id);
        
        if(response >= 1){
            // Success response
            var msg = {success: "Employee " + req.query.emp_id + " deleted."}
            
        }else{
            // Error response
            var msg = {error: "Employee " + req.query.emp_id + " does not exist."}
        }

        res.status(200).type("json").send(JSON.stringify(msg));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
        res.status(200).type("json").send(msg);
    }
});



// Get Timecard: Method returns a specific Timecard record for the requested Timecard id
base.get("/timecard" , (req, res)=>{
    try{    
        // Check for the empty timecard_id
        const timecardId = validate.checkEmptyParam(req.query.timecard_id, "timecard_id");
    
        if(timecardId !== null)
            throw timecardId;
        
        // Get timecard    
        const response = datalayer.getTimecard(req.query.timecard_id);
        
        // Check for the empty timecard response
        if(response == null)
            throw "No timecard found for timecard_id "+ req.query.timecard_id;
        // Success response
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
        res.status(200).type("json").send(msg);
    }
});



// Get all Timecards: Method returns a list of Timecards for the existing Employee id
base.get("/timecards" , (req, res)=>{
    try{
        // Check for the empty emp_id
        const empId = validate.checkEmptyParam(req.query.emp_id, "emp_id");
    
        if(empId !== null)
            throw empId;

        // Get all timecards    
        const response = datalayer.getAllTimecard(req.query.emp_id);

        // Check if timecard list is empty
        if(response === undefined || response.length == 0)
            throw "No timecard found for the employee "+ req.query.emp_id;
        
        // Success response    
        res.status(200).type("json").send(JSON.stringify(response));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
        res.status(200).type("json").send(msg);
    }
});



// Insert a Timecard: Method inserts a new record for a Timecard and returns the inserted Timecard
base.post("/timecard" ,  (req, res)=>{
    
    try{
        // Check for start datetime format(YYYY-MM-DD HH:mm:ss)
        const startTime = validate.checkDateTimeFormat(req.body.start_time, "start_time");
        
        if(startTime !== null)
            throw startTime;
        
        // Check for end datetime format    
        const endTime = validate.checkDateTimeFormat(req.body.end_time, "end_time");
        
        if(endTime !== null)
            throw endTime;
        
        // Check for non-existing emp_id    
        const validEmpId = validate.validateEmpId(req.body.emp_id);
        
        if(validEmpId !== null)
            throw validEmpId;    

        // Validate if start day is existing day    
        const validateSameStartDate = validate.validateSameStartDate(req.body.emp_id,req.body.start_time);
        
        if(validateSameStartDate != null)
            throw validateSameStartDate;    
        
        // Validate for the start_time should be upto a week older than current date    
        const validStartTime = validate.validateStartTime(req.body.start_time);
        
        if(validStartTime !== null)
            throw validStartTime;

        // Validate if start date is a Saturday or Sunday 
        const validStartDay = validate.validateWeekDay(req.body.start_time, "start_time");

        if(validStartDay != null)
            throw validStartDay;

        // Validate if end date is a Saturday or Sunday    
        const validEndDay = validate.validateWeekDay(req.body.end_time, "end_time");

        if(validEndDay != null)
            throw validEndDay;    

        // validate if end_time should be atleast 1 hour greater than the start_time on same day    
        const validEndStartDiff = validate.validateEndStartDiff(req.body.start_time,req.body.end_time);

        if(validEndStartDiff != null)
            throw validEndStartDiff;

        // validate for the start_time should be in between 06:00:00 and 18:00:00 inclusive    
        const validateStartHours = validate.validateHours(req.body.start_time,"start_time");

        if(validateStartHours != null)
            throw validateStartHours;    
        
        // Validate for the end_time should be in between 06:00:00 and 18:00:00 inclusive    
        const validateEndHours = validate.validateHours(req.body.end_time,"end_time");    
        
        if(validateEndHours != null)
            throw validateEndHours;    

        // Insert timecard    
        const response =  datalayer.insertTimecard(req.body);
        
        if(response == null){
            // Error response
            var msg = {error: "Error in processing."}
            
            res.status(200).type("json").send(msg);
        }else{
            // Success response
            const jsonResp = {success: response};

            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
        res.status(200).type("json").send(msg);
    }
});



// Update Timecard: Method updates the existing Timecard details and returns the updated Timecard
base.put("/timecard" , (req, res)=>{
    
    try{
        // Check for the empty timecard_id
        const timecardId = validate.checkEmptyParam(req.body.timecard_id, "timecard_id");
        
        if(timecardId !== null)
            throw timecardId;
        
        // Get timecard    
        const timecard = datalayer.getTimecard(req.body.timecard_id);

        if(timecard != null){
            
            if((req.body.emp_id !== null) && (req.body.emp_id !== undefined)){
                
                // Check for the existing emp_id
                const validEmpId = validate.validateEmpId(req.body.emp_id);
        
                if(validEmpId !== null)
                    throw validEmpId;
                
                timecard.setEmpId(parseInt(req.body.emp_id));

            }
            if((req.body.start_time !== null) && (req.body.start_time !== undefined)){
                
                // Check for the start_time format
                const startTime = validate.checkDateTimeFormat(req.body.start_time, "start_time");
        
                if(startTime !== null)
                    throw startTime;    

                // validate for the start_time should be upto a week older than current date    
                const validStartTime = validate.validateStartTime(req.body.start_time);
        
                if(validStartTime !== null)
                    throw validStartTime;
            
                // validate that start_time should not be a Saturday or Sunday     
                const validStartDay = validate.validateWeekDay(req.body.start_time, "start_time");
                    
                if(validStartDay != null)
                    throw validStartDay;
                
                // Validate that start_time should be in between 06:00:00 and 18:00:00 inclusive 
                const validateStartHours = validate.validateHours(req.body.start_time,"start_time");
                
                if(validateStartHours != null)
                    throw validateStartHours;

                if((req.body.emp_id !== null) && (req.body.emp_id !== undefined)){   
                    
                    // Check if there is an existing record with the same startDate 
                    const validateSameStartDate = validate.validateSameStartDate(req.body.emp_id,req.body.start_time);

                    if(validateSameStartDate != null)
                        throw validateSameStartDate;    
                
                }                    

                timecard.setStartTime(req.body.start_time);

            }
            if((req.body.end_time !== null) && (req.body.end_time !== undefined)){
                
                // check for the end_time(datetime) format
                const endTime = validate.checkDateTimeFormat(req.body.end_time, "end_time");
                
                if(endTime !== null)
                    throw endTime;
                
                // Check that end_time should not be a Saturday or Sunday    
                const validEndDay = validate.validateWeekDay(req.body.end_time, "end_time");
        
                if(validEndDay != null)
                    throw validEndDay;        
                
                // Validate that end_time should be in between 06:00:00 and 18:00:00 inclusive    
                const validateEndHours = validate.validateHours(req.body.end_time,"end_time");
                
                if(validateEndHours != null)
                    throw validateEndHours;        

                timecard.setEndTime(req.body.end_time);
            }
            if((req.body.start_time !== null) && (req.body.start_time !== undefined) &&
               (req.body.end_time !== null) && (req.body.end_time !== undefined)){

                // Validate if end_time should be atleast 1 hour greater than the start_time on same day
                const validEndStartDiff = validate.validateEndStartDiff(req.body.start_time,req.body.end_time);
                
                if(validEndStartDiff != null)
                    throw validEndStartDiff;

            }
            
            // Update timecard
            const  response = datalayer.updateTimecard(timecard);

            const jsonResp = {success: response};
            
            // Success response
            res.status(200).type("json").send(JSON.stringify(jsonResp));
        }
        else{
            // Error response
            var msg = {error: "No matching timecard found for the timecard_id " + req.body.timecard_id}

            res.status(200).type("json").send(JSON.stringify(msg));
        }
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});



// Delete Timecard: Method deletes Timecard records for the requested timecard_id
base.delete("/timecard" , (req, res)=>{

    try{
        // Check for the empty timecard_id
        const timecardId = validate.checkEmptyParam(req.query.timecard_id, "timecard_id");
    
        if(timecardId !== null)
            throw timecardId;
        
        // Delete timecard
        const response = datalayer.deleteTimecard(req.query.timecard_id);
        
        // Check if timecard already deleted
        if(response>=1){
          // Success response
          var msg = { success: "timecard_id " + req.query.timecard_id + " deleted."}    
        }
        else{
           // Error response 
          var msg = { error: "timecard_id " + req.query.timecard_id + " does not exist."}       
        }
        
        res.status(200).type("json").send(JSON.stringify(msg));
    }
    catch(err){
        // Catch error
        var msg = {error: err}
         
         res.status(200).type("json").send(msg);
    }
});
