export interface Product {
    id: string;
    name_es: string;
    name_en: string;
    price: number;
    image: string;
    calories?: number;
    tags: string[];
}

export const CATALOG: Product[] = [
    {
        id: "p1",
        name_es: "Vianda Saludable - Pollo con Vegetales",
        name_en: "Healthy Lunchbox - Chicken with Veggies",
        price: 1200,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
        calories: 450,
        tags: ["Low Carb", "Protein"]
    },
    {
        id: "p2",
        name_es: "Bowl Vegano de Quinoa",
        name_en: "Vegan Quinoa Bowl",
        price: 950,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
        calories: 380,
        tags: ["Vegan", "Gluten Free"]
    },
    {
        id: "p3",
        name_es: "Plan Keto Semanal (5 Viandas)",
        name_en: "Weekly Keto Plan (5 Meals)",
        price: 5500,
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
        calories: 600,
        tags: ["Keto", "High Protein"]
    },
    {
        id: "p4",
        name_es: "Pasta Integral con Pesto",
        name_en: "Whole Wheat Pasta with Pesto",
        price: 850,
        image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400",
        calories: 520,
        tags: ["Energizing"]
    },
    {
        id: "p5",
        name_es: "Salmón Grillado con Espárragos",
        name_en: "Grilled Salmon with Asparagus",
        price: 2100,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400",
        calories: 410,
        tags: ["Premium", "Omega 3"]
    },
    {
        id: "p6",
        name_es: "Tiradito de Atún Marinado",
        name_en: "Marinated Tuna Tiradito",
        price: 1800,
        image: "https://images.unsplash.com/photo-1516685018646-54838b470d67?auto=format&fit=crop&q=80&w=400",
        calories: 320,
        tags: ["Fresh", "Low Cal"]
    }
];
