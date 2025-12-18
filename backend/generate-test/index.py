import json
import random
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация тестов по охране труда с использованием базы знаний по актуальным стандартам
    Args: event - dict с httpMethod, body (title, category, topic, questionCount)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с сгенерированными вопросами по нормативам
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    title: str = body_data.get('title', '')
    category: str = body_data.get('category', 'iot')
    topic: str = body_data.get('topic', 'occupational-safety')
    question_count: int = body_data.get('questionCount', 10)
    
    if not title:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Title is required'})
        }
    
    questions = generate_questions_by_topic(title, category, topic, question_count)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'questions': questions,
            'message': f'Сгенерировано {len(questions)} вопросов на основе актуальных нормативов'
        })
    }

def generate_questions_by_topic(title: str, category: str, topic: str, count: int) -> List[Dict]:
    """Генерация вопросов на основе темы с использованием базы знаний"""
    
    question_pools = {
        'occupational-safety': get_occupational_safety_questions(),
        'first-aid': get_first_aid_questions(),
        'fire-safety': get_fire_safety_questions(),
        'work-at-height': get_work_at_height_questions(),
        'explosives': get_explosives_questions(),
        'underground-mining': get_underground_mining_questions(),
        'other': get_general_safety_questions()
    }
    
    pool = question_pools.get(topic, get_general_safety_questions())
    
    if count > len(pool):
        pool = pool * (count // len(pool) + 1)
    
    selected = random.sample(pool, min(count, len(pool)))
    
    questions = []
    for i, q_template in enumerate(selected):
        question_id = f"q_{i+1}_{random.randint(1000, 9999)}"
        questions.append({
            'id': question_id,
            'text': q_template['text'],
            'type': q_template['type'],
            'answers': [
                {
                    'id': f"{question_id}_a{j+1}",
                    'text': ans['text'],
                    'isCorrect': ans['correct']
                }
                for j, ans in enumerate(q_template['answers'])
            ],
            'explanation': q_template.get('explanation', ''),
            'points': q_template.get('points', 1)
        })
    
    return questions

def get_occupational_safety_questions() -> List[Dict]:
    """Вопросы по охране труда согласно ТК РФ и Правилам по охране труда"""
    return [
        {
            'text': 'Какова максимальная продолжительность рабочего времени в неделю согласно ТК РФ?',
            'type': 'single',
            'answers': [
                {'text': '40 часов', 'correct': True},
                {'text': '48 часов', 'correct': False},
                {'text': '36 часов', 'correct': False},
                {'text': '44 часа', 'correct': False}
            ],
            'explanation': 'Согласно ст. 91 ТК РФ нормальная продолжительность рабочего времени не может превышать 40 часов в неделю',
            'points': 1
        },
        {
            'text': 'Что обязан сделать работник при несчастном случае на производстве?',
            'type': 'multiple',
            'answers': [
                {'text': 'Немедленно известить своего непосредственного руководителя', 'correct': True},
                {'text': 'Обеспечить сохранность обстановки места происшествия', 'correct': True},
                {'text': 'Оказать первую помощь пострадавшему', 'correct': True},
                {'text': 'Составить акт формы Н-1', 'correct': False}
            ],
            'explanation': 'Согласно ст. 214 ТК РФ работник обязан немедленно известить руководителя, оказать помощь и сохранить обстановку. Акт составляет комиссия.',
            'points': 2
        },
        {
            'text': 'Кто проводит вводный инструктаж по охране труда?',
            'type': 'single',
            'answers': [
                {'text': 'Специалист по охране труда', 'correct': True},
                {'text': 'Непосредственный руководитель работ', 'correct': False},
                {'text': 'Инженер по технике безопасности цеха', 'correct': False},
                {'text': 'Директор предприятия', 'correct': False}
            ],
            'explanation': 'Вводный инструктаж проводит специалист по охране труда или работник, на которого приказом возложены эти обязанности (п. 10 Постановления № 2464)',
            'points': 1
        },
        {
            'text': 'Какова периодичность обязательных медицинских осмотров для работников вредных условий труда?',
            'type': 'single',
            'answers': [
                {'text': 'Не реже 1 раза в год', 'correct': True},
                {'text': 'Не реже 1 раза в 2 года', 'correct': False},
                {'text': 'Не реже 1 раза в 6 месяцев', 'correct': False},
                {'text': 'По требованию работодателя', 'correct': False}
            ],
            'explanation': 'Согласно Приказу Минздрава России от 28.01.2021 № 29н периодические осмотры работников вредных условий проводятся не реже 1 раза в год',
            'points': 1
        },
        {
            'text': 'Что входит в обязанности работодателя в области охраны труда?',
            'type': 'multiple',
            'answers': [
                {'text': 'Обеспечение безопасности работников при эксплуатации зданий, оборудования', 'correct': True},
                {'text': 'Проведение специальной оценки условий труда', 'correct': True},
                {'text': 'Обучение по охране труда и проверка знаний требований охраны труда', 'correct': True},
                {'text': 'Контроль за соблюдением работниками режима труда и отдыха', 'correct': False}
            ],
            'explanation': 'Обязанности работодателя установлены ст. 214 ТК РФ. Контроль режима - это право, а не обязанность.',
            'points': 2
        }
    ]

def get_first_aid_questions() -> List[Dict]:
    """Вопросы по первой помощи согласно Приказу Минздрава 1269н"""
    return [
        {
            'text': 'Какова правильная последовательность оказания первой помощи?',
            'type': 'single',
            'answers': [
                {'text': 'Оценка обстановки → вызов скорой помощи → оказание первой помощи', 'correct': True},
                {'text': 'Оказание первой помощи → оценка обстановки → вызов скорой помощи', 'correct': False},
                {'text': 'Вызов скорой помощи → оценка обстановки → оказание первой помощи', 'correct': False},
                {'text': 'Оценка обстановки → оказание первой помощи → вызов скорой помощи', 'correct': False}
            ],
            'explanation': 'Согласно алгоритму оказания первой помощи необходимо: 1) оценить безопасность, 2) вызвать 112/103, 3) оказать первую помощь',
            'points': 1
        },
        {
            'text': 'Какова правильная частота компрессий грудной клетки при сердечно-легочной реанимации?',
            'type': 'single',
            'answers': [
                {'text': '100-120 компрессий в минуту', 'correct': True},
                {'text': '60-80 компрессий в минуту', 'correct': False},
                {'text': '80-100 компрессий в минуту', 'correct': False},
                {'text': '120-140 компрессий в минуту', 'correct': False}
            ],
            'explanation': 'По рекомендациям ERC 2021 и Приказа Минздрава оптимальная частота компрессий составляет 100-120 в минуту',
            'points': 1
        },
        {
            'text': 'Что необходимо сделать при артериальном кровотечении?',
            'type': 'multiple',
            'answers': [
                {'text': 'Наложить жгут выше места ранения', 'correct': True},
                {'text': 'Зафиксировать время наложения жгута', 'correct': True},
                {'text': 'Обработать рану йодом', 'correct': False},
                {'text': 'Наложить стерильную повязку', 'correct': True}
            ],
            'explanation': 'При артериальном кровотечении накладывается жгут выше раны, фиксируется время (не более 1 часа зимой, 2 часов летом), затем стерильная повязка',
            'points': 2
        },
        {
            'text': 'Какое положение придать пострадавшему без сознания при отсутствии травм?',
            'type': 'single',
            'answers': [
                {'text': 'Устойчивое боковое положение', 'correct': True},
                {'text': 'На спине с приподнятыми ногами', 'correct': False},
                {'text': 'Полусидя', 'correct': False},
                {'text': 'На животе', 'correct': False}
            ],
            'explanation': 'Устойчивое боковое положение предотвращает западение языка и обеспечивает свободное дыхание',
            'points': 1
        },
        {
            'text': 'Что входит в состав аптечки первой помощи на производстве?',
            'type': 'multiple',
            'answers': [
                {'text': 'Жгут кровоостанавливающий', 'correct': True},
                {'text': 'Бинты стерильные', 'correct': True},
                {'text': 'Анальгин, аспирин', 'correct': False},
                {'text': 'Устройство для искусственного дыхания', 'correct': True}
            ],
            'explanation': 'Согласно Приказу Минздрава 1331н в аптечке не должно быть лекарственных средств, только перевязочные и вспомогательные материалы',
            'points': 2
        }
    ]

def get_fire_safety_questions() -> List[Dict]:
    """Вопросы по пожарной безопасности согласно ППР РФ"""
    return [
        {
            'text': 'Какой класс пожара обозначается буквой "А"?',
            'type': 'single',
            'answers': [
                {'text': 'Пожар твердых горючих веществ', 'correct': True},
                {'text': 'Пожар жидких горючих веществ', 'correct': False},
                {'text': 'Пожар газообразных веществ', 'correct': False},
                {'text': 'Пожар металлов', 'correct': False}
            ],
            'explanation': 'Согласно ГОСТ 27331-87: класс А - твердые вещества, В - жидкости, С - газы, D - металлы, Е - электроустановки',
            'points': 1
        },
        {
            'text': 'Каким огнетушителем нельзя тушить электроустановки под напряжением?',
            'type': 'single',
            'answers': [
                {'text': 'Пенным', 'correct': True},
                {'text': 'Углекислотным', 'correct': False},
                {'text': 'Порошковым', 'correct': False},
                {'text': 'Хладоновым', 'correct': False}
            ],
            'explanation': 'Пенные огнетушители содержат воду, которая проводит электрический ток. Запрещены для тушения электроустановок.',
            'points': 1
        },
        {
            'text': 'Какова периодичность проверки огнетушителей в производственных помещениях?',
            'type': 'single',
            'answers': [
                {'text': 'Не реже 1 раза в год', 'correct': True},
                {'text': 'Не реже 1 раза в 6 месяцев', 'correct': False},
                {'text': 'Не реже 1 раза в 2 года', 'correct': False},
                {'text': 'Не реже 1 раза в 3 месяца', 'correct': False}
            ],
            'explanation': 'Согласно СП 9.13130.2009 огнетушители проверяются не реже 1 раза в год с занесением в журнал',
            'points': 1
        },
        {
            'text': 'Что необходимо сделать при обнаружении пожара?',
            'type': 'multiple',
            'answers': [
                {'text': 'Немедленно сообщить в пожарную охрану по телефону 101', 'correct': True},
                {'text': 'Принять меры по эвакуации людей', 'correct': True},
                {'text': 'Приступить к тушению пожара', 'correct': True},
                {'text': 'Собрать ценные вещи', 'correct': False}
            ],
            'explanation': 'ППР в РФ (Постановление № 1479): вызов пожарных, эвакуация, тушение доступными средствами',
            'points': 2
        },
        {
            'text': 'На каком расстоянии от эвакуационных выходов можно размещать оборудование?',
            'type': 'single',
            'answers': [
                {'text': 'Не менее 1 метра', 'correct': True},
                {'text': 'Не менее 0,5 метра', 'correct': False},
                {'text': 'Не менее 1,5 метра', 'correct': False},
                {'text': 'Не регламентируется', 'correct': False}
            ],
            'explanation': 'Согласно ППР в РФ ширина эвакуационных путей должна быть не менее 1 метра',
            'points': 1
        }
    ]

def get_work_at_height_questions() -> List[Dict]:
    """Вопросы по работам на высоте согласно Правилам по охране труда № 782н"""
    return [
        {
            'text': 'С какой высоты работы относятся к работам на высоте?',
            'type': 'single',
            'answers': [
                {'text': 'С высоты 1,8 метра и более', 'correct': True},
                {'text': 'С высоты 2 метров и более', 'correct': False},
                {'text': 'С высоты 1,5 метра и более', 'correct': False},
                {'text': 'С высоты 3 метров и более', 'correct': False}
            ],
            'explanation': 'Согласно Приказу Минтруда № 782н работы на высоте - это работы на высоте 1,8 м и более над поверхностью земли',
            'points': 1
        },
        {
            'text': 'Какие группы по безопасности работ на высоте существуют?',
            'type': 'single',
            'answers': [
                {'text': '1, 2 и 3 группы', 'correct': True},
                {'text': '1 и 2 группы', 'correct': False},
                {'text': 'А, Б и В группы', 'correct': False},
                {'text': 'Начальная, основная и высшая', 'correct': False}
            ],
            'explanation': 'Приказ № 782н устанавливает 3 группы: 1 группа - работники, 2 группа - мастера и бригадиры, 3 группа - руководители',
            'points': 1
        },
        {
            'text': 'Какова максимальная продолжительность работы в страховочной системе без перерыва?',
            'type': 'single',
            'answers': [
                {'text': 'Не более 15 минут', 'correct': True},
                {'text': 'Не более 30 минут', 'correct': False},
                {'text': 'Не более 10 минут', 'correct': False},
                {'text': 'Не регламентируется', 'correct': False}
            ],
            'explanation': 'Согласно правилам работы на высоте непрерывное нахождение в страховочной системе не должно превышать 15 минут',
            'points': 1
        },
        {
            'text': 'Что должно входить в систему обеспечения безопасности работ на высоте?',
            'type': 'multiple',
            'answers': [
                {'text': 'Страховочная привязь', 'correct': True},
                {'text': 'Соединительные элементы (стропы, карабины)', 'correct': True},
                {'text': 'Анкерное устройство', 'correct': True},
                {'text': 'Монтажный пояс', 'correct': False}
            ],
            'explanation': 'Система включает: привязь, соединительные элементы и анкерное устройство. Монтажные пояса запрещены с 2015 года',
            'points': 2
        },
        {
            'text': 'Каков срок действия удостоверения для работ на высоте с 1 группой?',
            'type': 'single',
            'answers': [
                {'text': '3 года', 'correct': True},
                {'text': '5 лет', 'correct': False},
                {'text': '1 год', 'correct': False},
                {'text': 'Бессрочно', 'correct': False}
            ],
            'explanation': 'Периодическое обучение работников 1 группы проводится не реже 1 раза в 3 года (Приказ № 782н)',
            'points': 1
        }
    ]

def get_explosives_questions() -> List[Dict]:
    """Вопросы по взрывному делу"""
    return [
        {
            'text': 'Какие виды взрывчатых материалов применяются в горном деле?',
            'type': 'multiple',
            'answers': [
                {'text': 'Промышленные взрывчатые вещества', 'correct': True},
                {'text': 'Средства инициирования', 'correct': True},
                {'text': 'Детонирующий шнур', 'correct': True},
                {'text': 'Пиротехнические составы', 'correct': False}
            ],
            'explanation': 'В горном деле применяются ВВ, СИ и детонирующий шнур. Пиротехника не относится к промышленным ВМ',
            'points': 2
        },
        {
            'text': 'На каком расстоянии должна находиться опасная зона при взрывных работах?',
            'type': 'single',
            'answers': [
                {'text': 'Определяется проектом на взрывные работы', 'correct': True},
                {'text': 'Не менее 100 метров', 'correct': False},
                {'text': 'Не менее 200 метров', 'correct': False},
                {'text': 'Не менее 500 метров', 'correct': False}
            ],
            'explanation': 'Опасная зона определяется проектом в зависимости от условий, типа ВВ и масштаба взрыва',
            'points': 1
        },
        {
            'text': 'Кто имеет право производить взрывные работы?',
            'type': 'single',
            'answers': [
                {'text': 'Лица, имеющие Единую книжку взрывника', 'correct': True},
                {'text': 'Любой работник с допуском', 'correct': False},
                {'text': 'Лица с высшим техническим образованием', 'correct': False},
                {'text': 'Мастера-взрывники и инженеры', 'correct': False}
            ],
            'explanation': 'Право на ведение взрывных работ имеют только лица с Единой книжкой взрывника',
            'points': 1
        }
    ]

def get_underground_mining_questions() -> List[Dict]:
    """Вопросы по безопасности в подземных выработках"""
    return [
        {
            'text': 'Какая минимальная высота горных выработок для прохода людей?',
            'type': 'single',
            'answers': [
                {'text': '1,8 метра в свету', 'correct': True},
                {'text': '2,0 метра в свету', 'correct': False},
                {'text': '1,5 метра в свету', 'correct': False},
                {'text': '2,2 метра в свету', 'correct': False}
            ],
            'explanation': 'Минимальная высота проходных выработок составляет 1,8 м согласно Правилам безопасности',
            'points': 1
        },
        {
            'text': 'Что обязан иметь при себе каждый работник в подземной выработке?',
            'type': 'multiple',
            'answers': [
                {'text': 'Самоспасатель', 'correct': True},
                {'text': 'Головной светильник', 'correct': True},
                {'text': 'Именной жетон', 'correct': True},
                {'text': 'Средства связи', 'correct': False}
            ],
            'explanation': 'Обязательны: самоспасатель, головной светильник и именной жетон для учета спуска-подъема',
            'points': 2
        },
        {
            'text': 'Какова максимально допустимая температура воздуха в подземных выработках?',
            'type': 'single',
            'answers': [
                {'text': '+26°C', 'correct': True},
                {'text': '+30°C', 'correct': False},
                {'text': '+28°C', 'correct': False},
                {'text': '+24°C', 'correct': False}
            ],
            'explanation': 'Максимальная температура в рабочих выработках не должна превышать +26°C',
            'points': 1
        }
    ]

def get_general_safety_questions() -> List[Dict]:
    """Общие вопросы по охране труда"""
    return get_occupational_safety_questions()[:3] + get_first_aid_questions()[:2]
