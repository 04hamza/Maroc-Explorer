<?php

return [
    'required' => 'حقل :attribute مطلوب.',
    'string' => 'يجب أن يكون :attribute نصًا.',
    'numeric' => 'يجب أن يكون :attribute رقمًا.',
    'integer' => 'يجب أن يكون :attribute عددًا صحيحًا.',
    'boolean' => 'يجب أن يكون :attribute صحيحًا أو خاطئًا.',
    'array' => 'يجب أن يكون :attribute مصفوفة.',
    'unique' => 'تم أخذ :attribute بالفعل.',
    'exists' => ':attribute المحدد غير صالح.',
    'min' => [
        'numeric' => 'يجب أن يكون :attribute على الأقل :min.',
        'array' => 'يجب أن يحتوي :attribute على :min عنصر على الأقل.',
    ],
    'max' => [
        'numeric' => 'لا يجوز أن يكون :attribute أكبر من :max.',
    ],
    'size' => [
        'numeric' => 'يجب أن يحتوي :attribute على :size عنصر بالضبط.',
    ],
    'custom' => [
        'latitude' => [
            'min' => 'يجب أن تكون خط العرض بين -90 و90.',
            'max' => 'يجب أن تكون خط العرض بين -90 و90.',
        ],
        'longitude' => [
            'min' => 'يجب أن تكون خط الطول بين -180 و180.',
            'max' => 'يجب أن تكون خط الطول بين -180 و180.',
        ],
        'zoom' => [
            'min' => 'يجب أن يكون التكبير بين 0 و22.',
            'max' => 'يجب أن يكون التكبير بين 0 و22.',
        ],
    ],
    'attributes' => [
        'slug' => 'معرف المنطقة',
        'latitude' => 'خط العرض',
        'longitude' => 'خط الطول',
        'zoom' => 'التكبير',
        'is_published' => 'حالة النشر',
        'translations' => 'الترجمات',
        'translations.0.language_code' => 'كود اللغة',
        'translations.0.name' => 'اسم المنطقة',
        'translations.0.description' => 'الوصف',
        'translations.0.image' => 'الصورة',
        'translations.0.Total_Population' => 'إجمالي السكان',
        'translations.0.Area' => 'المساحة',
        'translations.0.Number_Provinces' => 'عدد المحافظات',
        'translations.0.Numbrer_Communes' => 'عدد البلديات',
        'translations.0.Urbanization_Rate' => 'معدل التحضر',
        'sections' => 'الأقسام',
        'sections.*.slug' => 'معرف القسم',
        'sections.*.order' => 'ترتيب القسم',
        'sections.*.translations' => 'ترجمات القسم',
        'sections.*.translations.0.language_code' => 'كود لغة القسم',
        'sections.*.translations.0.title' => 'عنوان القسم',
        'sections.*.translations.0.content' => 'محتوى القسم',
        'sections.*.translations.0.image' => 'صورة القسم',
    ],
];