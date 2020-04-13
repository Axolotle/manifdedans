import random
import string


def fake_populate():
    data = {}
    emojis = ['😡', '🤬', '😵', '🤔', '😷', '🦠', '😤']
    words = ['Macron', 'Castaner', 'Philippe', 'réforme', 'points',
             'coronavirus', 'virus', 'gueule', 'éborgneur', 'hôpital',
             'ehpad', 'services', 'public', 'de', 'honte', 'la', 'le',
             'où', 'est', 'con', 'justice', '\n'] + emojis
    for n in range(1000):
        ppl = ''
        has_msg = random.randint(0, 15)
        if has_msg > 13:
            n = random.randint(5, 15)
            ppl = ' '.join([random.choice(words) for _ in range(n)])
        else:
            ppl = random.choice(emojis)
        data[get_fake_id()] = [ppl, True if has_msg > 13 else False]
    return data


def get_fake_id():
    return ''.join([random.choice(string.ascii_letters + string.digits)
                    for n in range(32)])
