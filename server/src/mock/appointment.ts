import { getNextId, readDb, writeDb, Appointment, Slot } from "./db"
import { getProfessionalById } from "./professional";

type CreateAppointment = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isReminderSent'>;

export const getAvailableSlots = async (professionalId: number, serviceId: number): Promise<Slot[]> => {
  const db = readDb();

  const service = db.services.find(s => s.id === serviceId);
  if (service === undefined) throw new Error("Service not found.");

  const prof = await getProfessionalById(professionalId);
  if (prof === undefined) throw new Error("Proffesional not found.");

  const schedules = prof.schedules.filter(s => s.professionalId === professionalId);
  if (schedules.length === 0) return []; // No schedules for this professional

  const allAppointments = db.appointments.filter(appt => appt.professionalId === professionalId);

  const availableSlots: Slot[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start from the beginning of today

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);
  thirtyDaysLater.setHours(23, 59, 59, 999); // End of the day for inclusive comparison

  for (let i = 0; i <= 30; i++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + i);

    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday...
    const scheduleForDay = schedules.find(s => s.dayOfWeek === dayOfWeek);

    if (!scheduleForDay) {
      continue; // No schedule for this day
    }

    const dayStartDateTime = combineDateAndTime(currentDate, scheduleForDay.startTime);
    const dayEndDateTime = combineDateAndTime(currentDate, scheduleForDay.endTime);

    // Filter appointments for the current day
    const appointmentsForDay = allAppointments.filter(appt =>
      appt.appointmentDate === formatDateToYYYYMMDD(currentDate)
    ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)); // Sort by start time

    let currentAvailableSegments: { start: Date; end: Date }[] = [{
      start: dayStartDateTime,
      end: dayEndDateTime
    }];

    // Adjust the start of the first segment if it's today and the time has already passed
    if (formatDateToYYYYMMDD(currentDate) === formatDateToYYYYMMDD(new Date())) {
        const currentTime = new Date();
        if (currentAvailableSegments[0].start < currentTime) {
            currentAvailableSegments[0].start = currentTime;
        }
    }


    // Subtract existing appointments from available segments
    for (const appt of appointmentsForDay) {
      const apptStartDateTime = combineDateAndTime(currentDate, appt.startTime);
      const apptEndDateTime = combineDateAndTime(currentDate, appt.endTime);

      const nextAvailableSegments: { start: Date; end: Date }[] = [];

      for (const segment of currentAvailableSegments) {
        // Only consider segments that actually have time remaining
        if (segment.start >= segment.end) continue;

        // Case 1: Appointment completely covers the segment
        if (apptStartDateTime <= segment.start && apptEndDateTime >= segment.end) {
          // Segment is fully consumed, do nothing
        }
        // Case 2: Appointment is fully within the segment, splitting it
        else if (apptStartDateTime > segment.start && apptEndDateTime < segment.end) {
          nextAvailableSegments.push({ start: segment.start, end: apptStartDateTime });
          nextAvailableSegments.push({ start: apptEndDateTime, end: segment.end });
        }
        // Case 3: Appointment overlaps with the start of the segment
        else if (apptStartDateTime <= segment.start && apptEndDateTime > segment.start && apptEndDateTime < segment.end) {
          nextAvailableSegments.push({ start: apptEndDateTime, end: segment.end });
        }
        // Case 4: Appointment overlaps with the end of the segment
        else if (apptStartDateTime > segment.start && apptStartDateTime < segment.end && apptEndDateTime >= segment.end) {
          nextAvailableSegments.push({ start: segment.start, end: apptStartDateTime });
        }
        // Case 5: No overlap
        else {
          nextAvailableSegments.push(segment);
        }
      }
      currentAvailableSegments = nextAvailableSegments;
    }

    // Generate specific slots from the remaining available segments
    for (const segment of currentAvailableSegments) {
      let currentSlotStart = segment.start;

      while (getDurationInMinutes(currentSlotStart, segment.end) >= service.durationMinutes) {
        const potentialSlotEnd = new Date(currentSlotStart.getTime() + service.durationMinutes * 60 * 1000);

        // Ensure the potential slot end does not exceed the segment end
        if (potentialSlotEnd <= segment.end) {
          availableSlots.push({
            professionalId: professionalId,
            serviceId: serviceId,
            date: formatDateToYYYYMMDD(currentDate),
            startTime: formatTime(currentSlotStart),
            endTime: formatTime(potentialSlotEnd),
          });
          currentSlotStart = potentialSlotEnd; // Move to the end of the just-created slot
        } else {
          break; // No more full slots can fit
        }
      }
    }
  }

  return availableSlots;
};

export const addAppointment = async (appointmentData: CreateAppointment): Promise<Appointment> => {
    const db = readDb();

    // Simular FK (no se inserta si no existe el padre)
    if (!db.clients.some(c => c.id === appointmentData.clientId)) throw new Error('Client not found (FK).');
    if (!db.professionals.some(p => p.id === appointmentData.professionalId)) throw new Error('Professional not found (FK).');
    if (!db.services.some(s => s.id === appointmentData.serviceId)) throw new Error('Service not found (FK).');

    const newAppointment: Appointment = {
        id: getNextId(db.appointments),
        ...appointmentData,
        status: 'PENDING',
        isReminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    db.appointments.push(newAppointment);
    writeDb(db);
    return newAppointment;
};

export const getAppointments = async (professionalId?: number, serviceId?: number): Promise<Appointment[]> => {
    const db = readDb();
    return db.appointments.filter(appt =>
        (professionalId === undefined || appt.professionalId === professionalId) &&
        (serviceId === undefined || appt.serviceId === serviceId)
    );
};

// --- Helper Functions for Date/Time Calculations ---
function timeToMinutes(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 60 + minutes + (seconds / 60); // Include seconds for precision
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60); // Convert fractional minutes to seconds

  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function combineDateAndTime(date: Date, timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, seconds, 0);
  return combined;
}

function getDurationInMinutes(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60);
}

function formatDateToYYYYMMDD(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function pad(num: any) {
    return num.toString().padStart(2, '0');
}

function formatTime(date: any) { // <-- Aquí está definida
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
