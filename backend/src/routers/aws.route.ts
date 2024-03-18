import express from 'express';
import { getUploadUrl } from '../controllers/aws.controller';

const awsRoute = express.Router();

awsRoute.get('/get-upload-url', getUploadUrl);

export default awsRoute;
