import { create } from 'zustand';
import { Address } from '../types';
import { localStorageService } from '../services/storage/asyncStorage';
import { PRESET_HUBS } from '../services/location/locationService';

interface AddressState {
  addresses: Address[];
  isLoaded: boolean;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
}

const SEED_ADDRESSES: Address[] = [
  {
    id: 'addr_seed_1',
    label: 'Home',
    contactName: 'Olivia Smith',
    contactPhone: '9876543210',
    streetAddress: 'Flat 402, Sunshine Heights, 100ft Road',
    landmark: 'Near Indiranagar Metro Pillar 42',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: PRESET_HUBS.bengaluru_indiranagar.lat,
    longitude: PRESET_HUBS.bengaluru_indiranagar.lon,
    instructions: 'Ring doorbell twice. Leave with security if not reachable.',
    isDefault: true,
  },
  {
    id: 'addr_seed_2',
    label: 'Work',
    contactName: 'Olivia Smith',
    contactPhone: '9876543210',
    streetAddress: 'Tower B, 7th Floor, RMZ Ecospace, Outer Ring Road',
    landmark: 'Bellandur Flyover Junction',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560103',
    latitude: 12.9260,
    longitude: 77.6762,
    instructions: 'Call upon arrival at main security gate for visitor badge.',
    isDefault: false,
  },
  {
    id: 'addr_seed_3',
    label: 'Other',
    customLabel: 'Mom & Dad',
    contactName: 'Ethan Brooks',
    contactPhone: '9876599887',
    streetAddress: 'House 14, 80 Feet Road, 4th Block Koramangala',
    landmark: 'Opposite Sony World Signal',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    latitude: PRESET_HUBS.bengaluru_koramangala.lat,
    longitude: PRESET_HUBS.bengaluru_koramangala.lon,
    isDefault: false,
  },
];

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoaded: false,
  isLoading: false,

  hydrate: async () => {
    try {
      let stored = await localStorageService.getAddresses();
      if (!stored || stored.length === 0) {
        stored = SEED_ADDRESSES;
        await localStorageService.saveAddresses(stored);
      }
      set({ addresses: stored, isLoaded: true });
    } catch {
      set({ addresses: SEED_ADDRESSES, isLoaded: true });
    }
  },

  addAddress: async (addrData: Omit<Address, 'id'>) => {
    set({ isLoading: true });
    const newAddress: Address = {
      ...addrData,
      id: `addr_${Date.now()}`,
    };

    let updated = [...get().addresses];
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    } else if (updated.length === 0) {
      newAddress.isDefault = true;
    }
    updated.unshift(newAddress);

    await localStorageService.saveAddresses(updated);
    set({ addresses: updated, isLoading: false });
    return newAddress;
  },

  updateAddress: async (id: string, updates: Partial<Address>) => {
    set({ isLoading: true });
    let updated = get().addresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      if (updates.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    await localStorageService.saveAddresses(updated);
    set({ addresses: updated, isLoading: false });
    const target = updated.find((a) => a.id === id)!;
    return target;
  },

  deleteAddress: async (id: string) => {
    set({ isLoading: true });
    const filtered = get().addresses.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    await localStorageService.saveAddresses(filtered);
    set({ addresses: filtered, isLoading: false });
  },

  setDefaultAddress: async (id: string) => {
    const updated = get().addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await localStorageService.saveAddresses(updated);
    set({ addresses: updated });
  },

  getDefaultAddress: () => {
    return get().addresses.find((a) => a.isDefault) || get().addresses[0];
  },
}));

