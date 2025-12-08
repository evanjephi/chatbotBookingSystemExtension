import { Request, Response } from 'express';
import { FirebaseService } from '../services/firebaseService.js';
import pswMatchingService from '../services/pswMatchingService.js';
import type {
  AvailablePSWsRequest,
  AvailablePSWsResponse,
} from '../types/index.js';

export class PSWController {
  async getAvailablePSWs(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const {
        location,
        radius,
        desiredDate,
        startTime,
        endTime,
        serviceType,
      } = req.body as AvailablePSWsRequest;

      if (!location || !radius || !desiredDate || !startTime || !endTime) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get all PSWs
      const allPSWs = await firebaseService.getAllPSWs();

      // Filter by proximity
      let filtered = pswMatchingService.filterByProximity(
        allPSWs,
        location,
        radius
      );

      // Filter by availability
      filtered = pswMatchingService.filterByAvailability(
        filtered,
        new Date(desiredDate),
        startTime,
        endTime
      );

      // Filter by service type if provided
      if (serviceType) {
        filtered = pswMatchingService.filterByServiceType(filtered, serviceType);
      }

      // Rank PSWs
      const ranked = pswMatchingService.rankPSWs(filtered, location);

      const response: AvailablePSWsResponse = {
        pswProfiles: ranked,
        totalCount: ranked.length,
      };

      res.json(response);
    } catch (error) {
      console.error('Get available PSWs error:', error);
      res.status(500).json({ error: 'Failed to retrieve available PSWs' });
    }
  }

  async getPSWProfile(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { pswId } = req.params;

      const psw = await firebaseService.getPSW(pswId);

      if (!psw) {
        res.status(404).json({ error: 'PSW not found' });
        return;
      }

      res.json(psw);
    } catch (error) {
      console.error('Get PSW profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve PSW profile' });
    }
  }

  async searchPSWs(req: Request, res: Response): Promise<void> {
    try {
      const firebaseService = FirebaseService.getInstance();
      const { query, lat, lng } = req.query;

      if (
        !query ||
        typeof query !== 'string' ||
        typeof lat !== 'string' ||
        typeof lng !== 'string'
      ) {
        res.status(400).json({ error: 'Missing required query parameters' });
        return;
      }

      const allPSWs = await firebaseService.getAllPSWs();

      // Simple search by name or service type
      const filtered = allPSWs.filter(
        (psw) =>
          psw.name.toLowerCase().includes(query.toLowerCase()) ||
          psw.serviceTypes.some((service) =>
            service.toLowerCase().includes(query.toLowerCase())
          )
      );

      // Rank by proximity to provided coordinates
      const ranked = pswMatchingService.rankPSWs(filtered, {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });

      res.json({
        results: ranked,
        totalCount: ranked.length,
      });
    } catch (error) {
      console.error('Search PSWs error:', error);
      res.status(500).json({ error: 'Failed to search PSWs' });
    }
  }
}

export default new PSWController();
