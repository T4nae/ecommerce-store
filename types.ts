export interface Store {
    id: string;
    name: string;
    billboardId: string;
}

export interface Billboard {
    id: string;
    label: string;
    imageUrl: string;
}

export interface Category {
    id: string;
    name: string;
    billboard: Billboard;
}

export interface Product {
    id: string;
    category: Category;
    name: string;
    price: string;
    quantity: number;
    isFeatured: boolean;
    isArchived: boolean;
    size: Size;
    color: Color;
    images: Image[];
}

export interface Image {
    id: string;
    url: string;
}

export interface Size {
    id: string;
    name: string;
    value: string;
}

export interface Color {
    id: string;
    name: string;
    value: string;
}

export interface Analytics {
    id: string;
    session: string;
    storeId: string;
    event: string;
    data: string;
    createdAt: Date;
    updatedAt: Date;
}
