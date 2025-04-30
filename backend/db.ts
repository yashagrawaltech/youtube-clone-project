import mongoose from 'mongoose';
import type { ConnectToDBInterface } from './types';
import { devlog } from './utils';
import { config } from './config';

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000;

class ConnectToDB implements ConnectToDBInterface {
    private retryCount: number;
    private isConnected: boolean;
    uri: string;

    constructor(uri: string) {
        this.retryCount = 0;
        this.isConnected = false;
        this.uri = uri;

        mongoose.set('strictQuery', true);

        mongoose.connection.on('connected', () => {
            devlog(
                `MongoDB connected successfully at host ${mongoose.connection.host}`
            );
            this.isConnected = true;
        });

        mongoose.connection.on('error', (error) => {
            if (error instanceof Error) {
                devlog(`MongoDB connection error occurred: ${error.message}`);
            } else {
                devlog(
                    `MongoDB connection error occurred due to some unknown error`
                );
            }
            this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            devlog(
                `MongoDB disconnected successfully at host ${mongoose.connection.host}`
            );
            this.handleDisconnection();
        });

        process.on('SIGTERM', this.handleAppTermination.bind(this));
    }

    async connect() {
        if (!this.uri) throw new Error(`MongoDB connection string is missing`);

        try {
            const connectionOptions = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 5000,
                family: 4, // IPv4
            };

            if (config.node_env === 'development') {
                mongoose.set('debug', true);
            }

            await mongoose.connect(this.uri, connectionOptions);

            this.retryCount = 0;
        } catch (error) {
            if (error instanceof Error) {
                devlog(`MongoDB connection error: ${error.message}`);
            } else {
                devlog(`MongoDB connection error: unknown error`);
            }
            await this.handleConnectionError(error);
        }
    }

    async handleDisconnection() {
        if (this.isConnected) {
            devlog(`Attempting to reconnect to MongoDB`);
            return this.connect();
        }
    }

    async handleConnectionError(lastError: unknown) {
        if (this.retryCount < MAX_RETRIES) {
            this.retryCount += 1;
            if (lastError instanceof Error) {
                devlog(
                    `Retrying MongoDB connection attempt ${this.retryCount} of ${MAX_RETRIES} due to error: ${lastError.message}`
                );
            } else {
                devlog(
                    `Retrying MongoDB connection attempt ${this.retryCount} of ${MAX_RETRIES} due to error: unknown error`
                );
            }
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, RETRY_INTERVAL);
            });

            return this.connect();
        } else {
            if (lastError instanceof Error) {
                throw new Error(
                    `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${lastError.message}`
                );
            } else {
                throw new Error(
                    `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: unknown error`
                );
            }
        }
    }

    async handleAppTermination() {
        try {
            await mongoose.connection.close();
            devlog(`MongoDB connection closed`);
            process.exit(0);
        } catch (error) {
            if (error instanceof Error) {
                devlog(`Error closing MongoDB connection: ${error.message}`);
            } else {
                devlog(`Error closing MongoDB connection: unknown error`);
            }
            process.exit(1); // Exit with error code
        }
    }

    getDBConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };
    }
}

const connection = new ConnectToDB(config.mongodb_uri);

export const connectToMongoDB = connection.connect.bind(connection);
export const getDBStatus = connection.getDBConnectionStatus.bind(connection);
