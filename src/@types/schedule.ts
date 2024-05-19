export interface Schedule {
    id: number,
    idCustomer: number,
    idEmployee: number,
    idService: number,
    customerName: string,
    employeeName: string,
    serviceName: string,
    customerPhone: string,
    servicePrice: number,
    dateSchedule: string,
    hourSchedule: string,
    status: string
    observation: string,
    reasonCancellation: string,
    whoCancelled: string,
}