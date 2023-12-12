import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Product } from "@/types";
import toast from "react-hot-toast";

interface CartStore {
    items: Product[];
    addItem: (data: Product) => void;
    removeItem: (id: String) => void;
    removeFirstItem: (id: String) => void;
    removeAll: () => void;
}

const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            addItem: (data: Product) => {
                // const currentItems = get().items;
                // const existingItem = currentItems.find(
                //     (item) => item.id === data.id
                // );

                // if (existingItem) {
                //     return toast("Item already in cart.");
                // }
                set({ items: [...get().items, data] });
                toast.success("Item added to cart.");
            },
            removeItem: (id: String) => {
                set({
                    items: [...get().items.filter((item) => item.id !== id)],
                });
                toast.success("Item removed from cart.");
            },
            removeFirstItem: (id: String) => {
                const currentItems = get().items;
                const sameItems = currentItems.filter((item) => item.id === id);
                sameItems.pop();
                set({
                    items: [
                        ...get().items.filter((item) => item.id !== id),
                        ...sameItems,
                    ],
                });
            },
            removeAll: () => set({ items: [] }),
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCart;
