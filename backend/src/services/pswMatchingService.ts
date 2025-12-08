import type {
  Location,
  PSWProfile,
  TimeSlot,
} from '../types/index.js';

const EARTH_RADIUS_KM = 6371;

export class PSWMatchingService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Filter PSWs by proximity to client location
   */
  filterByProximity(
    pswProfiles: PSWProfile[],
    clientLocation: Location,
    radiusKm: number
  ): PSWProfile[] {
    return pswProfiles.filter((psw) => {
      const distance = this.calculateDistance(
        clientLocation.latitude,
        clientLocation.longitude,
        psw.location.latitude,
        psw.location.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Check if PSW is available for requested time slot
   */
  isAvailableForTimeSlot(
    availableSlots: TimeSlot[],
    requestedDate: Date,
    requestedStartTime: string,
    requestedEndTime: string
  ): boolean {
    const requestedDateStr = requestedDate.toISOString().split('T')[0];

    return availableSlots.some((slot) => {
      const slotDateStr = new Date(slot.date).toISOString().split('T')[0];

      // Check date match
      if (slotDateStr !== requestedDateStr) {
        return false;
      }

      // Parse times for comparison
      const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number);
      const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number);
      const [reqStartHour, reqStartMin] = requestedStartTime
        .split(':')
        .map(Number);
      const [reqEndHour, reqEndMin] = requestedEndTime.split(':').map(Number);

      const slotStart = slotStartHour * 60 + slotStartMin;
      const slotEnd = slotEndHour * 60 + slotEndMin;
      const reqStart = reqStartHour * 60 + reqStartMin;
      const reqEnd = reqEndHour * 60 + reqEndMin;

      // Check time overlap
      return reqStart >= slotStart && reqEnd <= slotEnd;
    });
  }

  /**
   * Filter PSWs by availability for requested time slot
   */
  filterByAvailability(
    pswProfiles: PSWProfile[],
    requestedDate: Date,
    startTime: string,
    endTime: string
  ): PSWProfile[] {
    return pswProfiles.filter((psw) =>
      this.isAvailableForTimeSlot(
        psw.availableTimeSlots,
        requestedDate,
        startTime,
        endTime
      )
    );
  }

  /**
   * Filter PSWs by service type
   */
  filterByServiceType(
    pswProfiles: PSWProfile[],
    serviceType: string
  ): PSWProfile[] {
    if (!serviceType) return pswProfiles;
    return pswProfiles.filter((psw) =>
      psw.serviceTypes.some(
        (type) => type.toLowerCase() === serviceType.toLowerCase()
      )
    );
  }

  /**
   * Filter PSWs by minimum rating
   */
  filterByRating(
    pswProfiles: PSWProfile[],
    minRating: number
  ): PSWProfile[] {
    if (!minRating || minRating <= 0) return pswProfiles;
    return pswProfiles.filter((psw) => psw.ratings >= minRating);
  }

  /**
   * Filter PSWs by certifications
   */
  filterByCertifications(
    pswProfiles: PSWProfile[],
    requiredCertifications: string[]
  ): PSWProfile[] {
    if (!requiredCertifications || requiredCertifications.length === 0) {
      return pswProfiles;
    }

    return pswProfiles.filter((psw) =>
      requiredCertifications.every((cert) =>
        psw.certifications.some(
          (pswCert) => pswCert.toLowerCase() === cert.toLowerCase()
        )
      )
    );
  }

  /**
   * Score PSWs based on multiple criteria
   */
  scorePSWs(
    pswProfiles: PSWProfile[],
    clientLocation: Location
  ): Array<PSWProfile & { score: number }> {
    return pswProfiles.map((psw) => {
      let score = 100;

      // Proximity score (closer is better)
      const distance = this.calculateDistance(
        clientLocation.latitude,
        clientLocation.longitude,
        psw.location.latitude,
        psw.location.longitude
      );
      score -= distance * 2; // Reduce score by 2 points per km

      // Rating score
      score += psw.ratings * 5; // 5 points per rating star

      // Review count score (more reviews = more reliable)
      score += Math.min(psw.reviewCount * 0.5, 10);

      return {
        ...psw,
        score: Math.max(0, score),
      };
    });
  }

  /**
   * Rank PSWs by score
   */
  rankPSWs(pswProfiles: PSWProfile[], clientLocation: Location): PSWProfile[] {
    return this.scorePSWs(pswProfiles, clientLocation)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...psw }) => psw);
  }
}

export default new PSWMatchingService();
