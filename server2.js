const express = require('express');
const app = express();
const port = 3002;

const swaggerJsdoc= require('swagger-jsdoc');
const swaggerUi= require('swagger-ui-express');
const cors= require('cors');

const options={
    swaggerDefinition:{
    openapi: '3.0.0',
    componenets: {},
        info: {
            title: 'Assignment 08',
            version: '1.0.0',
            description: 'Addition of swagger to REST-like API'
        },
        host: '142.93.250.54:3002',
        basePath: '/',
    },
    apis: ['./server2.js'],

};

const specs= swaggerJsdoc(options);

app.use('/docs',swaggerUi.serve, swaggerUi.setup(specs));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));


const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host : 'localhost',
        user : 'root',
        password: 'root',
        database:  'sample',
        port: 3306,
        connectionLimit:5
});

const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { param } = require('express-validator');


const validateCompany = [body('COMPANY_ID', 'Company ID cannot be empty').notEmpty().trim().escape().isNumeric().isLength({max: 10}),
body('COMPANY_NAME', 'Company name cannot be empty').notEmpty().trim().escape(),
body('COMPANY_CITY', 'City name cannot be empty').notEmpty().trim().escape()];

const validateCity = [body('COMPANY_CITY', 'City name cannot be empty').notEmpty().trim().escape()];
const validateCompanyName = [body('COMPANY_NAME', 'Company name cannot be empty').notEmpty().trim().escape()];
const validateCompanyID = [param('COMPANY_ID', 'Company ID cannot be empty').notEmpty().trim().escape().isNumeric().isLength({max: 10})];

/**
 * @swagger
 * /company:
 *    get:
 *      description: Return all companies
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              description: An object of company containing array of company id, name and city
 *          500:
 *              description: Error encountered while inserting company
 */
app.get('/company', async(req,resp) => {

    try {
                const result = await pool.query("SELECT * FROM company");
                resp.setHeader('Content-Type', 'application/json');
                resp.status(200).json(result);
        } catch (err) {
                const errResp = {result : 'failed', message: 'Error in getting company details'};
                resp.status(500).json(errResp);
        }

});


/**
 * @swagger
 * /customers:
 *    get:
 *      description: Return all customers
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              description: An object of customers containing array of customer code, name and city
 *          500:
 *              description: Error encountered while inserting customers
 */
app.get('/customers', async(req,resp) => {
    try {
            const result = await pool.query("SELECT * FROM customer");
            resp.setHeader('Content-Type', 'application/json');
            resp.status(200).json(result);
    } catch (err) {
            const errResp = {result : 'failed', message: 'Error in getting customer details'};
            resp.status(500).json(errResp);
    }
});

/**
 * @swagger
 * /student:
 *    get:
 *      description: Return all students
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              description: An object of students containing array of student name, title and class
 *          500:
 *              description: Error encountered while inserting students
 */
app.get('/student', async(req,resp) => {
    try {
            const result = await pool.query("SELECT * FROM student");
            resp.setHeader('Content-Type', 'application/json');
            resp.status(200).json(result);
    } catch (err) {
            const errResp = {result : 'failed', message: 'Error in getting student details'};
            resp.status(500).json(errResp);
    }
});


/**
 * @swagger
 * /foods:
 *    get:
 *      description: Return all foods
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              description: An object of foods containing array of food id, name, unit and food company
 *          500:
 *              description: Error encountered while inserting foods
 */
app.get('/foods', async(req,resp) => {
    try {
            const result = await pool.query("SELECT * FROM foods");
            resp.setHeader('Content-Type', 'application/json');
            resp.status(200).json(result);
    } catch (err) {
            const errResp = {result : 'failed', message: 'Error in getting food details'};
            resp.status(500).json(errResp);
    }
});


/**
 *
 * @swagger
 * /Addcompany:
 *    post:
 *      summary: Used to insert a company data
 *      description: This API is used to insert a company data
 *      requestBody:
 *            required: true
 *            content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             COMPANY_ID:
 *                                       type: string
 *                             COMPANY_NAME:
 *                                       type: string
 *                             COMPANY_CITY:
 *                                       type: string
 *      responses:
 *          200:
 *              description: A new company data has been added
 *          422:
 *              description: Error in validation
 *          500:
 *              description: Error encountered while inserting company
 */
app.post('/Addcompany', validateCompany, async(req,resp) => {

    let response = {result : 'failed', message: 'Error encountered inserting company'};

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }

     try {
         const {COMPANY_ID,COMPANY_NAME,COMPANY_CITY}= req.body;
         const result = await pool.query("INSERT INTO company VALUES (?,?,?)",[COMPANY_ID,COMPANY_NAME,COMPANY_CITY]);

         if (result.affectedRows) {
             response = {result : 'A new company data has been added'};
             resp.status(200);
         } else {
             resp.status(500);
         }
         resp.setHeader('Content-Type', 'application/json');
             resp.json(response);
     } catch (err) {
         response.message = err.message;
         resp.status(500);
         resp.json(response);
     }

});

/**
 *
 * @swagger
 * /company/{COMPANY_ID}:
 *    patch:
 *      summary: Used to update a company city field for a given company ID
 *      description: This API is used to insert a company data
 *      parameters:
 *         - in: path
 *           name: COMPANY_ID
 *           required: true
 *           description: ID of company that needs city to be updated
 *           schema:
 *              type: string
 *      requestBody:
 *            required: true
 *            content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             COMPANY_CITY:
 *                                       type: string
 *      responses:
 *          200:
 *              description: The company city has been updated
 *          422:
 *              description: Error in validation
 *          500:
 *              description: Error encountered while updating city
 */
app.patch('/company/:COMPANY_ID', validateCity,validateCompanyID,  async(req,resp) => {

    let response = {result : 'failed', message: 'Error encountered while updating city'};
    console.log(req.params.COMPANY_ID);
    console.log(req.query.COMPANY_ID);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return resp.status(422).json({ errors: errors.array() });
    }

     try {
        console.log(req.params.COMPANY_ID);
        console.log(req.query.COMPANY_ID);
         const comp_id = req.params.COMPANY_ID;
         const {COMPANY_CITY}= req.body;
         const result = await pool.query("UPDATE company set COMPANY_CITY= ? WHERE COMPANY_ID = ?", [COMPANY_CITY,comp_id])

         if (result.affectedRows) {
             response = {result : 'The company city has been updated successfully'};
             resp.status(200);
         } else {
             resp.status(500);
         }
         resp.setHeader('Content-Type', 'application/json');
             resp.json(response);
     } catch (err) {
         response.message = err.message;
         resp.status(500);
         resp.json(response);
     }
});


/**
 *
 * @swagger
 * /company/{COMPANY_ID}:
 *    delete:
 *      summary: Used to delete all fields of a company for a given company ID
 *      description: This API is used to delete a company's data from the table
 *      parameters:
 *         - in: path
 *           name: COMPANY_ID
 *           required: true
 *           description: ID of company that needs to be deleted
 *           schema:
 *              type: string
 *      responses:
 *          200:
 *              description: The company city has been updated
 *          422:
 *              description: Error in validation
 *          500:
 *              description: Error encountered while updating city
 */

app.delete('/company/:COMPANY_ID', validateCompanyID, async(req,resp) => {
console.log(req.query);

let response = {result : 'failed', message: 'Error encountered while deleting company'};
console.log(req.params.COMPANY_ID);
console.log(req.query.COMPANY_ID);
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return resp.status(422).json({ errors: errors.array() });
}

 try {
    console.log(req.params.COMPANY_ID);
    console.log(req.query.COMPANY_ID);
     const comp_id = req.params.COMPANY_ID;
     const {COMPANY_CITY}= req.body;
     const result = await pool.query("DELETE FROM company WHERE COMPANY_ID = ?",comp_id)

     if (result.affectedRows) {
         response = {result : 'The company has been deleted successfully'};
         resp.status(200);
     } else {
         resp.status(500);
     }
     resp.setHeader('Content-Type', 'application/json');
         resp.json(response);
 } catch (err) {
     response.message = err.message;
     resp.status(500);
     resp.json(response);
 }





});

/**
 *
 * @swagger
 * /company/{COMPANY_ID}:
 *    put:
 *      summary: Used to update all fiels of a company  for a given company ID
 *      description: This API is used to insert a new set of data for all fields of a given company ID
 *      parameters:
 *         - in: path
 *           name: COMPANY_ID
 *           required: true
 *           description: ID of company that needs to be updated
 *           schema:
 *              type: string
 *      requestBody:
 *            required: true
 *            content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             COMPANY_NAME:
 *                                       type: string
 *                             COMPANY_CITY:
 *                                       type: string
 *      responses:
 *          200:
 *              description: Company data has been updated
 *          422:
 *              description: Error in validation
 *          500:
 *              description: Error encountered while updating city
 */

app.put('/company/:COMPANY_ID', validateCity, validateCompanyID, validateCompanyName, async(req,resp) => {

        const err = validationResult(req);
        if (!err.isEmpty()) {
                return resp.status(422).json({ errors: errors.array() });
        }
        let response = {result : 'failed', message: 'Error updating city'};
        try {
            const comp_id = req.params.COMPANY_ID;
            const {COMPANY_NAME,COMPANY_CITY}= req.body;
            const result = await pool.query("UPDATE company set COMPANY_NAME= ?, COMPANY_CITY= ? WHERE COMPANY_ID = ?", [COMPANY_NAME,COMPANY_CITY,comp_id]);

           if (result.affectedRows) {
                response = {result : 'Company data has been updated'};
                resp.status(200);
            }  else {
               resp.status(404);
               response.message = "Company ID not found";
            }
            resp.setHeader('Content-Type', 'application/json');
            resp.json(response);
        } catch (err) {
            response.message = err.message;
            resp.status(500);
            resp.json(response);
        }
});



app.listen(port, () => {
console.log('Server2 app listening at http://localhost:${port}',port);

});
