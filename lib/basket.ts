export type BasketItem = {
  fixtureId: number;
  home: string;
  away: string;
  league: string;
  date: string;
  homeLogo?: string;
  awayLogo?: string;
  price: number;
};

const STORAGE_KEY = "profbint-basket";

export function getBasket(): BasketItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveBasket(items: BasketItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToBasket(item: BasketItem) {
  const basket = getBasket();

  const exists = basket.some(
    (basketItem) => basketItem.fixtureId === item.fixtureId
  );

  if (exists) {
    return basket;
  }

  const updated = [...basket, item];

  saveBasket(updated);

  return updated;
}

export function removeFromBasket(fixtureId: number) {
  const basket = getBasket().filter(
    (item) => item.fixtureId !== fixtureId
  );

  saveBasket(basket);

  return basket;
}

export function clearBasket() {
  saveBasket([]);
}

export function getBasketTotal(items: BasketItem[]) {
  return items.reduce((total, item) => total + item.price, 0);
}