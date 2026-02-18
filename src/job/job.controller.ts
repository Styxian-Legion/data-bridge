import type { Request, Response, NextFunction } from "express";

import Validation from "../../utils/validation";
import { JobSchema } from "./job.validator";
import JobService from "./job.service";
import ResponseSuccess from "../../utils/response-success";

export default class JobController {

    static async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { data } = await Validation(JobSchema, req.body);
            const response = await JobService.createJob(data);
            return new ResponseSuccess({
                status: 201,
                code: "JOB_CREATED",
                message: "Job created successfully.",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.query as any;
            let response;

            if (name) {
                response = await JobService.getJobByName(name);
            } else {
                response = await JobService.getJobs();
            }

            return new ResponseSuccess({
                status: 200,
                code: "JOBS_FETCHED",
                message: "Jobs fetched successfully.",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async runJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = (req.params as any);
            const response = await JobService.runJob(name);
            return new ResponseSuccess({
                status: 200,
                code: "JOB_RAN",
                message: "Job ran successfully.",
                data: response
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

}