import { atom } from 'jotai';
import { DashboardStats } from '../services/dashboard.service';

export const dashboardStatsAtom = atom<DashboardStats | null>(null);
export const dashboardLoadingAtom = atom<boolean>(false);