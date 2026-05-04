export type WarehouseFloor = {
  floor: number;
  name: string;
  shortName: string;
  description: string;
};

export const WAREHOUSE_FLOORS: WarehouseFloor[] = [
  {
    floor: 1,
    name: "Kho mát",
    shortName: "Kho mát",
    description: "Tầng 1 - Kho mát",
  },
  {
    floor: 2,
    name: "Kho thường",
    shortName: "Kho thường",
    description: "Tầng 2 - Kho thường",
  },
  {
    floor: 3,
    name: "Kho kiểm soát đặc biệt",
    shortName: "Kho đặc biệt",
    description: "Tầng 3 - Kho kiểm soát đặc biệt",
  },
];

export const WAREHOUSE_FLOOR_NUMBERS = WAREHOUSE_FLOORS.map(
  (warehouse) => warehouse.floor,
);

export function getWarehouseByFloor(floor: number) {
  return (
    WAREHOUSE_FLOORS.find((warehouse) => warehouse.floor === floor) ??
    WAREHOUSE_FLOORS[0]
  );
}
