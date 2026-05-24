export enum ItemType {
  MEDICINE = 'MEDICINE',
  EQUIPMENT = 'EQUIPMENT'
}

export enum MedicineCategory {
  TABLET = 'Tablet',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  DROPS = 'Drops',
  OINTMENT = 'Ointment',
  INHALER = 'Inhaler',
  CAPSULE = 'Capsule',
  SUPPLEMENT = 'Supplement'
}

export enum EquipmentCategory {
  MONITORING = 'Monitoring',
  MOBILITY_AID = 'Mobility Aid',
  WOUND_CARE = 'Wound Care',
  DIAGNOSTIC = 'Diagnostic'
}

export enum DosageSchedule {
  ONCE = 'ONCE',
  TWICE = 'TWICE',
  THRICE = 'THRICE',
  AS_NEEDED = 'AS_NEEDED'
}

export enum StorageCondition {
  ROOM_TEMP = 'ROOM_TEMP',
  REFRIGERATED = 'REFRIGERATED'
}

export enum Unit {
  STRIP = 'Strip',
  BOTTLE = 'Bottle',
  VIAL = 'Vial',
  BOX = 'Box',
  ML = 'ml',
  MG = 'mg',
  PIECE = 'Piece',
  SET = 'Set',
  PACK = 'Pack'
}

export interface Item {
  id: string
  userId: string
  name: string
  itemType: ItemType
  category: string
  unit: string
  currentQty: number
  minQty: number
  reorderQty: number | null
  expiryDate: string | null
  dosageSchedule: DosageSchedule | null
  prescriptionReq: boolean
  storageCondition: StorageCondition | null
  assignedTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ItemCreateInput {
  name: string
  itemType: ItemType
  category: string
  unit: string
  currentQty: number
  minQty: number
  expiryDate?: string | null
  dosageSchedule?: DosageSchedule | null
  prescriptionReq?: boolean
  storageCondition?: StorageCondition | null
  assignedTo?: string | null
  notes?: string | null
}

export interface ItemUpdateInput extends Partial<ItemCreateInput> {
  reorderQty?: number | null
}

export interface ReorderCalculation {
  itemId: string
  consumptionRate: number
  daysOfStockLeft: number
  reorderTrigger: boolean
  suggestedReorderQty: number
}