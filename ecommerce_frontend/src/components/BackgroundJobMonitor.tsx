import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

type Job = {
    jobId: number;
    orderId: number;
    jobType: string;
    status: string;
    message: string;
    updatedAt: string;
};

function BackgroundJobMonitor() {

    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {

        // Get JWT token
        const token = localStorage.getItem("token");

        // Load existing background jobs
        fetch(
`${import.meta.env.VITE_API_URL}/api/jobs`
, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch jobs: ${response.status}`
                    );
                }

                return response.json();
            })
            .then((data) => {
                setJobs(data);
            })
            .catch((error) => {
                console.error(
                    "Error loading background jobs:",
                    error
                );
            });

        // Create WebSocket/STOMP client
        const client = new Client({

            // IMPORTANT: Backend is running on 8081
            brokerURL:
                "ws://localhost:8081/ws-smartcart",

            reconnectDelay: 5000,

            onConnect: () => {

                console.log(
                    "WebSocket connected successfully"
                );

                // Subscribe to background job updates
                client.subscribe(
                    "/topic/jobs",
                    (message) => {

                        const updatedJob: Job =
                            JSON.parse(message.body);

                        setJobs((oldJobs) => {

                            const exists = oldJobs.some(
                                (job) =>
                                    job.jobId ===
                                    updatedJob.jobId
                            );

                            if (exists) {

                                return oldJobs.map((job) =>
                                    job.jobId ===
                                    updatedJob.jobId
                                        ? updatedJob
                                        : job
                                );

                            } else {

                                return [
                                    updatedJob,
                                    ...oldJobs
                                ];
                            }
                        });
                    }
                );
            },

            onStompError: (frame) => {

                console.error(
                    "STOMP error:",
                    frame.headers["message"]
                );
            },

            onWebSocketError: (error) => {

                console.error(
                    "WebSocket error:",
                    error
                );
            }
        });

        // Start WebSocket
        client.activate();

        // Cleanup
        return () => {
            client.deactivate();
        };

    }, []);

    return (
        <div className="job-monitor">

            <h2>Background Job Monitor</h2>

            <table>

                <thead>
                    <tr>
                        <th>Job ID</th>
                        <th>Order ID</th>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Message</th>
                    </tr>
                </thead>

                <tbody>

                    {jobs.length === 0 ? (

                        <tr>
                            <td colSpan={5}>
                                No background jobs found
                            </td>
                        </tr>

                    ) : (

                        jobs.map((job) => (

                            <tr key={job.jobId}>

                                <td>{job.jobId}</td>

                                <td>{job.orderId}</td>

                                <td>{job.jobType}</td>

                                <td
                                    className={
                                        job.status.toLowerCase()
                                    }
                                >
                                    {job.status}
                                </td>

                                <td>{job.message}</td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}

export default BackgroundJobMonitor;