import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProfessionals, getProfessionalServices, getSchedules } from "../mock/professional";
import { getServices } from "../mock/service";
import { getAvailableSlots } from "../mock/appointment";

// Create server instance
export const server = new McpServer({
    name: "appointment-bot",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

server.tool(
    "get-professionals",
    "Get all the professionals",
    {},
    async () => {
        const professionals = await getProfessionals()
        if (professionals.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "There are not any professional",
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `professionals: ${JSON.stringify(professionals)}`,
                },
            ],
        };
    }
);

server.tool(
    "get-professional-services",
    "Get all the services provided by one professional",
    {
        professionalId: z.number().int().min(1).describe("Id of the professional"),
    },
    async ({ professionalId }) => {
        const services = await getProfessionalServices(professionalId);
        console.log(services);
        if (services.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "The professional has not provide any services",
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `services: ${JSON.stringify(services)}`,
                },
            ],
        };
    }
);

server.tool(
    "get-services",
    "Get all the services",
    {},
    async () => {
        const services = await getServices();
        if (services.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "There are not any services",
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `services: ${JSON.stringify(services)}`,
                },
            ],
        };
    }
);

server.tool(
    "get-professional-schedules",
    "Get all schedules of one professional",
    {
        professionalId: z.number().int().min(1).describe("Id of the professional"),
    },
    async ({ professionalId }) => {
        const schedules = await getSchedules(professionalId);
        if (schedules.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "The professional has not any schedule",
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `schedules: ${JSON.stringify(schedules)}`,
                },
            ],
        };
    }
);

server.tool(
    "get-slots",
    "obtener los horarios disponibles en los que me puedo atender con un profesional con el servicio elegido",
    {
        professionalId: z.number().int().min(1).describe("Id of the professional"),
        serviceId: z.number().int().min(1).describe("Id of the service"),
    },
    async ({ professionalId, serviceId }) => {
        const slots = await getAvailableSlots(professionalId, serviceId);
        if (slots.length == 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "There are not any slots available",
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `slots: ${JSON.stringify(slots)}`,
                },
            ],
        };
    }
)
