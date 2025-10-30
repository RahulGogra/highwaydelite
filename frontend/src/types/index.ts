export interface Slot {
    _id: string;
    startTime: string;
    endTime: string;
    capacity: number;
    availableSeats: number;
}


export interface Experience {
    _id: string;
    name: string;
    price: string;
    description?: string;
    location?: string;
    imageUrl?: string;
    slots: Slot[];
}


export interface Booking {
    _id?: string;
    experienceId: string;
    slotId: string;
    date: string;
    customerName: string;
    customerEmail: string;
    promoCode?: string;
    pricePaid?: number;
}


export interface PromoValidation {
    valid: boolean;
    code: string;
    type: string;
    value: number;
    discount: number;
}