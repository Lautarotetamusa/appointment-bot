// generate-test-data.js
// Run this script using Node.js: node generate-test-data.js > seed.sql

function pad(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatTime(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// --- Sample Data Definitions ---
const sampleProfessionalNames = ['Dr. Alice', 'Dr. Bob', 'Nurse Carol', 'Therapist David'];
const sampleServiceNames = [
    { name: 'General Check-up', duration: 30, description: 'Routine health examination.' },
    { name: 'Follow-up Consultation', duration: 15, description: 'Quick follow-up after a previous visit.' },
    { name: 'Physical Therapy Session', duration: 60, description: 'One-on-one therapy session.' },
    { name: 'Vaccination', duration: 10, description: 'Administering a vaccine.' },
];
const sampleClientNames = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Pedro Rodriguez', 'Laura Fernandez'];
const samplePhoneNumbers = [
    '+5491112345678', '+5491187654321', '+5491122334455', '+5491199887766',
    '+5491155443322', '+5491110203040'
];

// --- Generated Data Arrays ---
const generatedProfessionals = [];
const generatedServices = [];
const generatedClients = [];
const generatedAvailableSlots = [];
const generatedAppointments = [];

let professionalIdCounter = 1;
let serviceIdCounter = 1;
let clientIdCounter = 1;
let availableSlotIdCounter = 1;
let appointmentIdCounter = 1;

// --- 1. Generate Professionals ---
console.log('-- Professionals');
sampleProfessionalNames.forEach(name => {
    const [firstName, lastName] = name.split(' ');
    const professional = {
        id: professionalIdCounter++,
        name: firstName,
        lastName: lastName || null,
        email: `${firstName.toLowerCase().replace('.', '')}.${(lastName || '').toLowerCase()}@clinic.com`,
        phone: `+549${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
        description: `Expert in ${firstName.includes('Dr.') ? 'medicine' : 'therapy'}.`,
        isActive: true,
    };
    generatedProfessionals.push(professional);
    console.log(`INSERT INTO professionals (id, name, last_name, email, phone, description, is_active, created_at, updated_at) VALUES (${professional.id}, '${professional.name}', ${professional.lastName ? `'${professional.lastName}'` : 'NULL'}, '${professional.email}', '${professional.phone}', '${professional.description}', ${professional.isActive}, NOW(), NOW());`);
});
console.log('\n');

// --- 2. Generate Services ---
console.log('-- Services');
sampleServiceNames.forEach(s => {
    const service = {
        id: serviceIdCounter++,
        serviceName: s.name,
        durationMinutes: s.duration,
        description: s.description,
    };
    generatedServices.push(service);
    console.log(`INSERT INTO service (id, service_name, duration_minutes, description, created_at, updated_at) VALUES (${service.id}, '${service.serviceName}', ${service.durationMinutes}, '${service.description}', NOW(), NOW());`);
});
console.log('\n');

// --- 3. Assign Services to Professionals (professional_service) ---
console.log('-- Professional-Services Assignments');
generatedProfessionals.forEach(professional => {
    // Assign 1-3 random service to each professional
    const serviceToAssign = generatedServices.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
    serviceToAssign.forEach(service => {
        const price = Math.floor(Math.random() * 100 + 50) * 100; // Price between 5000 and 15000 (cents)
        console.log(`INSERT INTO professional_service (professional_id, service_id, price, created_at, updated_at) VALUES (${professional.id}, ${service.id}, ${price}, NOW(), NOW());`);
    });
});
console.log('\n');

// --- 4. Generate Clients ---
console.log('-- Clients');
sampleClientNames.forEach((name, index) => {
    const [firstName, lastName] = name.split(' ');
    const client = {
        id: clientIdCounter++,
        name: firstName,
        lastName: lastName || null,
        whatsappPhone: samplePhoneNumbers[index % samplePhoneNumbers.length],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@client.com`,
    };
    generatedClients.push(client);
    console.log(`INSERT INTO client (id, name, last_name, whatsapp_phone, email, registration_date) VALUES (${client.id}, '${client.name}', '${client.lastName}', '${client.whatsappPhone}', '${client.email}', NOW());`);
});
console.log('\n');

// --- 5. Generate Available Slots for the next 30 days ---
console.log('-- Available Slots (next 30 days)');
const today = new Date();
today.setHours(0, 0, 0, 0); // Start from the beginning of today

for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
    }

    generatedProfessionals.forEach(professional => {
        // Assume professionals work from 9 AM to 5 PM with a lunch break
        const slots = [
            { start: '09:00:00', end: '13:00:00' },
            { start: '14:00:00', end: '17:00:00' },
        ];

        slots.forEach(slot => {
            const availableSlot = {
                id: availableSlotIdCounter++,
                professionalId: professional.id,
                slotDate: formatDate(currentDate),
                startTime: slot.start,
                endTime: slot.end,
                simultaneousCapacity: 1,
                isActive: true,
            };
            generatedAvailableSlots.push(availableSlot);
            console.log(`INSERT INTO available_slots (id, professional_id, slot_date, start_time, end_time, simultaneous_capacity, is_active, created_at, updated_at) VALUES (${availableSlot.id}, ${availableSlot.professionalId}, '${availableSlot.slotDate}', '${availableSlot.startTime}', '${availableSlot.endTime}', ${availableSlot.simultaneousCapacity}, ${availableSlot.isActive}, NOW(), NOW());`);
        });
    });
}
console.log('\n');

// --- 6. Generate Appointments within Available Slots ---
console.log('-- Appointments');
const bookedSlots = new Map(); // Map to track booked times for each professional and day

generatedAvailableSlots.forEach(slot => {
    const professionalId = slot.professionalId;
    const slotDate = slot.slotDate;
    const slotStartTime = combineDateAndTime(new Date(slotDate), slot.startTime);
    const slotEndTime = combineDateAndTime(new Date(slotDate), slot.endTime);

    // Initialize booked slots for this professional and day
    if (!bookedSlots.has(professionalId)) {
        bookedSlots.set(professionalId, new Map());
    }
    if (!bookedSlots.get(professionalId).has(slotDate)) {
        bookedSlots.get(professionalId).set(slotDate, []);
    }

    // Add initial slot boundaries to consider for appointment placement
    let currentFreeSegments = [{ start: slotStartTime, end: slotEndTime }];

    // Filter existing appointment that overlap with this slot (from *generated* data)
    const existingAppointmentsInSlot = generatedAppointments.filter(appt =>
        appt.professionalId === professionalId &&
        appt.appointmentDate === slotDate &&
        combineDateAndTime(new Date(appt.appointmentDate), appt.endTime) > slotStartTime &&
        combineDateAndTime(new Date(appt.appointmentDate), appt.startTime) < slotEndTime
    ).sort((a, b) => {
        const timeA = new Date(`2000/01/01 ${a.startTime}`);
        const timeB = new Date(`2000/01/01 ${b.startTime}`);
        return timeA.getTime() - timeB.getTime();
    });

    // Update free segments based on existing generated appointment
    for (const appt of existingAppointmentsInSlot) {
        const apptStart = combineDateAndTime(new Date(appt.appointmentDate), appt.startTime);
        const apptEnd = combineDateAndTime(new Date(appt.appointmentDate), appt.endTime);

        const nextFreeSegments = [];
        for (const segment of currentFreeSegments) {
            // Check for overlap and split segments
            if (apptStart < segment.end && apptEnd > segment.start) { // Overlap
                if (apptStart > segment.start) {
                    nextFreeSegments.push({ start: segment.start, end: apptStart });
                }
                if (apptEnd < segment.end) {
                    nextFreeSegments.push({ start: apptEnd, end: segment.end });
                }
            } else { // No overlap, keep segment
                nextFreeSegments.push(segment);
            }
        }
        currentFreeSegments = nextFreeSegments;
    }

    // Attempt to fill segments with new appointment
    currentFreeSegments.forEach(segment => {
        let currentPointer = segment.start;
        // Try to create 1-3 appointment in this segment
        const numAppointmentsToCreate = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numAppointmentsToCreate; i++) {
            const randomClient = generatedClients[Math.floor(Math.random() * generatedClients.length)];
            const availableServicesForProfessional = generatedServices.filter(s =>
                // Check if this service is assigned to this professional (simulated join)
                // In a real scenario, you'd fetch this from professional_service table
                Math.random() > 0.5 // Simplified: roughly half of the service are "offered" by this professional
            );
            if (availableServicesForProfessional.length === 0) continue;

            const randomService = availableServicesForProfessional[Math.floor(Math.random() * availableServicesForProfessional.length)];
            const serviceDuration = randomService.durationMinutes;

            const potentialEndTime = new Date(currentPointer.getTime() + serviceDuration * 60 * 1000);

            if (potentialEndTime <= segment.end) {
                // Check against other *generated* appointment for this professional and day
                const overlapsWithExisting = bookedSlots.get(professionalId).get(slotDate).some(bookedAppt => {
                    const bookedApptStart = combineDateAndTime(new Date(slotDate), bookedAppt.startTime);
                    const bookedApptEnd = combineDateAndTime(new Date(slotDate), bookedAppt.endTime);
                    return (currentPointer < bookedApptEnd && potentialEndTime > bookedApptStart);
                });

                if (!overlapsWithExisting) {
                    const appointment = {
                        id: appointmentIdCounter++,
                        clientId: randomClient.id,
                        professionalId: professionalId,
                        serviceId: randomService.id,
                        appointmentDate: slotDate,
                        startTime: formatTime(currentPointer),
                        endTime: formatTime(potentialEndTime),
                        // status: 'CONFIRMED', // Default status for generated data
                        // notes: `Generated appointment for ${randomService.serviceName}`,
                        // isReminderSent: false,
                    };
                    generatedAppointments.push(appointment);
                    bookedSlots.get(professionalId).get(slotDate).push(appointment); // Mark as booked

                    console.log(`INSERT INTO appointment (id, client_id, professional_id, service_id, date, start_time, end_time, created_at, updated_at) VALUES (${appointment.id}, ${appointment.clientId}, ${appointment.professionalId}, ${appointment.serviceId}, '${appointment.appointmentDate}', '${appointment.startTime}', '${appointment.endTime}', NOW(), NOW());`);

                    currentPointer = potentialEndTime; // Move pointer to end of this new appointment
                } else {
                    // Move pointer past the overlapping appointment, if possible
                    const nextFreeTime = existingAppointmentsInSlot.find(appt =>
                        combineDateAndTime(new Date(slotDate), appt.startTime) >= currentPointer
                    );
                    if (nextFreeTime) {
                        currentPointer = combineDateAndTime(new Date(slotDate), nextFreeTime.endTime);
                    } else {
                        break; // No more space in this segment
                    }
                }
            } else {
                break; // Not enough space for the service duration in this segment
            }
        }
    });
});

// Helper functions (copied from controller, adjust if needed for script-specific use)
function combineDateAndTime(date, timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, seconds, 0);
    return combined;
}

function getDurationInMinutes(start, end) {
    return (end.getTime() - start.getTime()) / (1000 * 60);
}
