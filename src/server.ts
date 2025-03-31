import express, { Request, Response, NextFunction} from 'express';
import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import dotenv from "dotenv";
import { Action } from "@copilotkit/shared";
import { fetchPeoplePhotos } from "./services/unsplashService";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Handle uncaught exceptions and unhandled rejections to prevent crashes
process.on("uncaughtException", (err: Error) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("Unhandled Rejection:", reason);
});

const serviceAdapter = new OpenAIAdapter({model: "gpt-4o"});



const fetchPhotos: Action<any> = {
    name: "fetchPeoplePhotos",
    description: "Fetches people photos.",
    parameters: [
        {
            name: "personImageUrl",
            type: "string",
            description: "The URL of the image for the person."
        },
    ],
    handler: async (args: any) => {
        try {
            const { personImageUrl } = args;
            const photos = await fetchPeoplePhotos();
            return { personImageUrl: photos };
        } catch (error) {
            console.error("Error in fetchPeoplePhotos:", error);
            throw new Error("Failed to fetch photos");
        }
    }
};

app.use('/copilotkit', async (req: Request, res: Response, next: NextFunction) => {
    try {

        /* const runtime = new CopilotRuntime({
            actions: [fetchPhotos],
            remoteActions: [
                {
                    url: "http://localhost:8000/copilotkit",
                },
            ],
        });*/

        const runtime = new CopilotRuntime({
            actions: ({ properties, url }) => [fetchPhotos]
        });

        const handler = copilotRuntimeNodeHttpEndpoint({
            endpoint: "/copilotkit",
            runtime,
            serviceAdapter,
        });

        return handler(req, res);
    } catch (error) {
        next(error); // Forward errors to global error handler
    }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/copilotkit`);
});
