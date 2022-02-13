interface OwnerLookup{
    name: string
    id: number
    avatar: string
}

const file = process.env.PUBLIC_URL + '/avatars/';

export const ownerMap: OwnerLookup[] = [
    { name: 'Ryan', id: 1, avatar: `${file}1.png`},
    { name: 'Tyler', id: 2, avatar: `${file}2.png`},
    { name: 'Caleb', id: 3, avatar: `${file}3.png`},
    { name: 'Trent', id: 4, avatar: `${file}4.png`},
    { name: 'Taylor', id: 5, avatar: `${file}5.png`},
    { name: 'Logan', id: 6, avatar: `${file}6.png`},
    { name: 'Cory', id: 7, avatar: `${file}7.png`},
    { name: 'Jeri', id: 8, avatar: `${file}8.png`},
    { name: 'Levi', id: 9, avatar: `${file}9.png`},
    { name: 'Aaron', id: 10, avatar: `${file}10.png`},
    { name: 'Juan', id: 11, avatar: `${file}11.png`},
    { name: 'Drew', id: 12, avatar: `${file}12.png`},
]

export const lastYear = 2021;