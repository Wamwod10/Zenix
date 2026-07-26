export const crmActivityTypes = [
  {
    id: "call",
    label: "Qo‘ng‘iroq",
    group: "communication",
  },
  {
    id: "email",
    label: "Email",
    group: "communication",
  },
  {
    id: "message",
    label: "Xabar",
    group: "communication",
  },
  {
    id: "meeting",
    label: "Uchrashuv",
    group: "communication",
  },
  {
    id: "note",
    label: "Izoh",
    group: "system",
  },
  {
    id: "purchase",
    label: "Xarid",
    group: "sales",
  },
  {
    id: "quotation",
    label: "Tijorat taklifi",
    group: "sales",
  },
  {
    id: "reservation",
    label: "Band qilish",
    group: "sales",
  },
  {
    id: "payment",
    label: "To‘lov",
    group: "finance",
  },
  {
    id: "refund",
    label: "Qaytarish",
    group: "finance",
  },
  {
    id: "debt",
    label: "Qarzdorlik",
    group: "finance",
  },
  {
    id: "task",
    label: "Vazifa",
    group: "tasks",
  },
  {
    id: "reminder",
    label: "Eslatma",
    group: "tasks",
  },
  {
    id: "status",
    label: "Holat o‘zgarishi",
    group: "system",
  },
  {
    id: "created",
    label: "Profil yaratildi",
    group: "system",
  },
];

export const crmActivities = [
  {
    id: "activity-001",
    customerId: "cus-001",
    type: "call",
    title: "Mijoz bilan telefon orqali bog‘lanildi",
    description:
      "Yangi mahsulotlar bo‘yicha shaxsiy taklif tushuntirildi. Mijoz kelasi haftada buyurtma berishini bildirdi.",
    createdAt: "2026-07-18T10:42:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    direction: "outgoing",
    outcome: "answered",
    status: "completed",
    pinned: true,
    details: [
      {
        label: "Davomiyligi",
        value: "6 daqiqa 24 soniya",
      },
      {
        label: "Natija",
        value: "Qayta aloqa belgilandi",
      },
    ],
  },
  {
    id: "activity-002",
    customerId: "cus-001",
    type: "task",
    title: "Qayta aloqa vazifasi yaratildi",
    description:
      "Mijozga yangi kolleksiya kelganidan keyin qo‘ng‘iroq qilish kerak.",
    createdAt: "2026-07-18T10:48:00+05:00",
    dueAt: "2026-07-22T11:00:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    assignedTo: "Aziza Karimova",
    status: "pending",
    details: [
      {
        label: "Muddat",
        value: "22-iyul, 11:00",
      },
      {
        label: "Muhimlik",
        value: "Yuqori",
      },
    ],
  },
  {
    id: "activity-003",
    customerId: "cus-001",
    type: "payment",
    title: "To‘lov qabul qilindi",
    description:
      "Buyurtma uchun Uzcard orqali to‘liq to‘lov amalga oshirildi.",
    createdAt: "2026-07-16T16:18:00+05:00",
    actor: {
      id: "employee-004",
      name: "Sardor Aliyev",
      role: "Kassir",
    },
    amount: 2840000,
    currency: "UZS",
    status: "completed",
    relatedEntity: {
      type: "payment",
      id: "pay-2841",
      label: "PAY-2841",
    },
    details: [
      {
        label: "To‘lov turi",
        value: "Uzcard",
      },
      {
        label: "Filial",
        value: "Chilonzor filiali",
      },
    ],
  },
  {
    id: "activity-004",
    customerId: "cus-001",
    type: "purchase",
    title: "Yangi xarid yakunlandi",
    description:
      "Mijoz 4 turdagi mahsulotdan jami 7 dona xarid qildi.",
    createdAt: "2026-07-16T16:15:00+05:00",
    actor: {
      id: "employee-004",
      name: "Sardor Aliyev",
      role: "Kassir",
    },
    amount: 2840000,
    currency: "UZS",
    status: "completed",
    relatedEntity: {
      type: "order",
      id: "order-1048",
      label: "ORD-1048",
    },
    details: [
      {
        label: "Mahsulotlar",
        value: "7 dona",
      },
      {
        label: "Chegirma",
        value: "5%",
      },
    ],
  },
  {
    id: "activity-005",
    customerId: "cus-001",
    type: "email",
    title: "Tijorat taklifi email orqali yuborildi",
    description:
      "Premium mijozlar uchun tayyorlangan individual narxlar va yetkazib berish shartlari yuborildi.",
    createdAt: "2026-07-14T12:30:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    direction: "outgoing",
    outcome: "delivered",
    status: "completed",
    details: [
      {
        label: "Qabul qiluvchi",
        value: "dilshod@example.uz",
      },
      {
        label: "Holati",
        value: "Yetkazildi",
      },
    ],
  },
  {
    id: "activity-006",
    customerId: "cus-001",
    type: "quotation",
    title: "Tijorat taklifi yaratildi",
    description:
      "Mijozning ulgurji xaridi uchun maxsus narx va to‘lov shartlari tayyorlandi.",
    createdAt: "2026-07-14T11:52:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    amount: 12600000,
    currency: "UZS",
    status: "pending",
    relatedEntity: {
      type: "quotation",
      id: "quote-0184",
      label: "QT-0184",
    },
    details: [
      {
        label: "Amal qilish muddati",
        value: "7 kun",
      },
      {
        label: "Chegirma",
        value: "8%",
      },
    ],
  },
  {
    id: "activity-007",
    customerId: "cus-001",
    type: "note",
    title: "Mijoz haqida ichki izoh qo‘shildi",
    description:
      "Mijoz asosan premium toifadagi mahsulotlarga qiziqadi. Aloqada qisqa va aniq takliflarni afzal ko‘radi.",
    createdAt: "2026-07-11T09:20:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    status: "completed",
    pinned: true,
  },
  {
    id: "activity-008",
    customerId: "cus-001",
    type: "message",
    title: "Telegram orqali xabar yuborildi",
    description:
      "Buyurtma yetkazib berishga tayyor ekanligi haqida avtomatik xabar yuborildi.",
    createdAt: "2026-07-09T18:05:00+05:00",
    actor: {
      id: "zenix-ai",
      name: "ZENIX avtomatizatsiyasi",
      role: "Tizim",
    },
    direction: "outgoing",
    outcome: "read",
    status: "completed",
    details: [
      {
        label: "Kanal",
        value: "Telegram",
      },
      {
        label: "Holati",
        value: "O‘qildi",
      },
    ],
  },
  {
    id: "activity-009",
    customerId: "cus-001",
    type: "meeting",
    title: "Filialda uchrashuv o‘tkazildi",
    description:
      "Mijoz bilan yangi hamkorlik shartlari va keyingi chorak xarid rejasi muhokama qilindi.",
    createdAt: "2026-07-05T15:00:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    status: "completed",
    details: [
      {
        label: "Manzil",
        value: "Chilonzor filiali",
      },
      {
        label: "Davomiyligi",
        value: "45 daqiqa",
      },
    ],
  },
  {
    id: "activity-010",
    customerId: "cus-001",
    type: "debt",
    title: "Qarzdorlik qisman yopildi",
    description:
      "Mijoz mavjud qarzdorlikning bir qismini bank o‘tkazmasi orqali to‘ladi.",
    createdAt: "2026-06-28T14:36:00+05:00",
    actor: {
      id: "employee-007",
      name: "Madina Xolmatova",
      role: "Moliya mutaxassisi",
    },
    amount: 1500000,
    currency: "UZS",
    status: "completed",
    details: [
      {
        label: "Oldingi qarz",
        value: "3 200 000 so‘m",
      },
      {
        label: "Qolgan qarz",
        value: "1 700 000 so‘m",
      },
    ],
  },
  {
    id: "activity-011",
    customerId: "cus-001",
    type: "status",
    title: "Mijoz holati yangilandi",
    description:
      "Mijoz “Yangi” holatidan “Faol” holatiga o‘tkazildi.",
    createdAt: "2026-05-20T10:10:00+05:00",
    actor: {
      id: "manager-001",
      name: "Aziza Karimova",
      role: "Savdo menejeri",
    },
    status: "completed",
    details: [
      {
        label: "Oldingi holat",
        value: "Yangi",
      },
      {
        label: "Yangi holat",
        value: "Faol",
      },
    ],
  },
  {
    id: "activity-012",
    customerId: "cus-001",
    type: "created",
    title: "Mijoz profili yaratildi",
    description:
      "Mijoz POS savdosi orqali avtomatik ravishda CRM bazasiga qo‘shildi.",
    createdAt: "2026-04-03T13:24:00+05:00",
    actor: {
      id: "zenix-system",
      name: "ZENIX tizimi",
      role: "Tizim",
    },
    status: "completed",
    details: [
      {
        label: "Manba",
        value: "POS",
      },
      {
        label: "Filial",
        value: "Chilonzor filiali",
      },
    ],
  },

  {
    id: "activity-013",
    customerId: "cus-002",
    type: "purchase",
    title: "Yangi xarid yakunlandi",
    description: "Mijoz chakana savdo orqali xarid qildi.",
    createdAt: "2026-07-17T17:42:00+05:00",
    actor: {
      id: "employee-002",
      name: "Kamola Ergasheva",
      role: "Kassir",
    },
    amount: 1260000,
    currency: "UZS",
    status: "completed",
  },
  {
    id: "activity-014",
    customerId: "cus-002",
    type: "call",
    title: "Mijoz bilan qo‘ng‘iroq amalga oshirildi",
    description:
      "Buyurtmani olib ketish vaqti mijoz bilan kelishildi.",
    createdAt: "2026-07-17T15:20:00+05:00",
    actor: {
      id: "manager-002",
      name: "Bekzod Rasulov",
      role: "Savdo menejeri",
    },
    direction: "outgoing",
    outcome: "answered",
    status: "completed",
  },
  {
    id: "activity-015",
    customerId: "cus-003",
    type: "task",
    title: "Qayta aloqa vazifasi",
    description:
      "Mijozga to‘lov muddati haqida eslatish kerak.",
    createdAt: "2026-07-18T09:10:00+05:00",
    dueAt: "2026-07-19T10:00:00+05:00",
    actor: {
      id: "manager-003",
      name: "Mohira Tursunova",
      role: "Hisob menejeri",
    },
    status: "pending",
  },
  {
    id: "activity-016",
    customerId: "cus-003",
    type: "debt",
    title: "Qarzdorlik muddati yaqinlashmoqda",
    description:
      "To‘lov muddati tugashiga ikki kun qoldi.",
    createdAt: "2026-07-18T08:00:00+05:00",
    actor: {
      id: "zenix-ai",
      name: "ZENIX AI",
      role: "Avtomatik nazorat",
    },
    amount: 4200000,
    currency: "UZS",
    status: "pending",
  },
  {
    id: "activity-017",
    customerId: "cus-004",
    type: "email",
    title: "Aksiya taklifi yuborildi",
    description:
      "Mijoz segmentiga mos mavsumiy chegirma yuborildi.",
    createdAt: "2026-07-15T11:15:00+05:00",
    actor: {
      id: "zenix-marketing",
      name: "ZENIX kampaniyasi",
      role: "Avtomatik yuborish",
    },
    direction: "outgoing",
    outcome: "opened",
    status: "completed",
  },
  {
    id: "activity-018",
    customerId: "cus-005",
    type: "refund",
    title: "Mahsulot qaytarildi",
    description:
      "Sifat talabi bo‘yicha bitta mahsulot qaytarib olindi.",
    createdAt: "2026-07-12T14:20:00+05:00",
    actor: {
      id: "employee-006",
      name: "Javohir Qodirov",
      role: "Administrator",
    },
    amount: 480000,
    currency: "UZS",
    status: "completed",
  },
];

export const getCustomerActivities = (customerId) =>
  crmActivities
    .filter(
      (activity) =>
        String(activity.customerId) === String(customerId),
    )
    .sort(
      (firstActivity, secondActivity) =>
        new Date(secondActivity.createdAt).getTime() -
        new Date(firstActivity.createdAt).getTime(),
    );