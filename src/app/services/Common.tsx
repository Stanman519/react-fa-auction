interface OwnerLookup{
    name: string
    id: number
    avatar: string
}

interface TmColor{
    team: string
    primary: string
    secondary: string
    text?: string
    logo: string
}

const file = process.env.PUBLIC_URL + '/avatars/';

export const lastYear = 2021;

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



export const tmColorMap: TmColor[] = [
    { team: 'BAL', primary: '#241773', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-baltimore-ravens-team-logo-2.png' },
    { team: 'CIN', primary: '#FB4F14', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-cincinnati-bengals-team-logo.png'  },
    { team: 'CLE', primary: '#311D00', secondary: '#FF3C00', logo: 'https://loodibee.com/wp-content/uploads/nfl-cleveland-browns-team-logo-2.png'  },
    { team: 'PIT', primary: '#FFB612', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-pittsburgh-steelers-team-logo-2.png'  },
    { team: 'BUF', primary: '#00338D', secondary: '#C60C30', logo: 'https://loodibee.com/wp-content/uploads/nfl-buffalo-bills-team-logo-2.png'  },
    { team: 'MIA', primary: '#008E97', secondary: '#FC4C02', logo: 'https://loodibee.com/wp-content/uploads/nfl-miami-dolphins-logo-2018.png'  },
    { team: 'NE', primary: '#002244', secondary: '#C60C30', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-england-patriots-team-logo-2.png'  },
    { team: 'NYJ', primary: '#125740', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-york-jets-team-logo.png'  },
    { team: 'HOU', primary: '#03202F', secondary: '#A71930', logo: 'https://loodibee.com/wp-content/uploads/nfl-houston-texans-team-logo-2.png'  },
    { team: 'IND', primary: '#002C5F', secondary: '#A2AAAD', logo: 'https://loodibee.com/wp-content/uploads/nfl-indianapolis-colts-team-logo-2.png'  },
    { team: 'JAX', primary: '#101820', secondary: '#D7A22A', logo: 'https://loodibee.com/wp-content/uploads/nfl-jacksonville-jaguars-team-logo-2.png'  },
    { team: 'TEN', primary: '#0C2340', secondary: '#4B92DB', logo: 'https://loodibee.com/wp-content/uploads/nfl-tennessee-titans-team-logo-2.png'  },
    { team: 'DEN', primary: '#FB4F14', secondary: '#002244', logo: 'https://loodibee.com/wp-content/uploads/nfl-denver-broncos-team-logo-2.png'  },
    { team: 'KC', primary: '#E31837', secondary: '#FFB81C', logo: 'https://loodibee.com/wp-content/uploads/nfl-kansas-city-chiefs-team-logo-2.png'  },
    { team: 'LV', primary: '#000000', secondary: '#A5ACAF', logo: 'https://loodibee.com/wp-content/uploads/nfl-oakland-raiders-team-logo.png'  },
    { team: 'LAC', primary: '#0080C6', secondary: '#FFC20E', logo: 'https://loodibee.com/wp-content/uploads/nfl-los-angeles-chargers-team-logo-2.png'  },
    { team: 'CHI', primary: '#0B162A', secondary: '#C83803', logo: 'https://loodibee.com/wp-content/uploads/nfl-chicago-bears-team-logo-2.png'  },
    { team: 'DET', primary: '#0076B6', secondary: '#B0B7BC', logo: 'https://loodibee.com/wp-content/uploads/nfl-detroit-lions-team-logo-2.png'  },
    { team: 'GB', primary: '#203731', secondary: '#FFB612', logo: 'https://loodibee.com/wp-content/uploads/nfl-green-bay-packers-team-logo-2.png'  },
    { team: 'MIN', primary: '#4F2683', secondary: '#FFC62F', logo: 'https://loodibee.com/wp-content/uploads/nfl-minnesota-vikings-team-logo-2.png'  },
    { team: 'DAL', primary: '#003594', secondary: '#041E42', logo: 'https://loodibee.com/wp-content/uploads/nfl-dallas-cowboys-team-logo-2.png'  },
    { team: 'NYG', primary: '#0B2265', secondary: '#A71930', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-york-giants-team-logo-2.png'  },
    { team: 'PHI', primary: '#004C54', secondary: '#A5ACAF', logo: 'https://loodibee.com/wp-content/uploads/nfl-philadelphia-eagles-team-logo-2.png'  },
    { team: 'WAS', primary: '#5A1414', secondary: '#FFB612', logo: 'https://loodibee.com/wp-content/uploads/washington-commanders-logo.png'  },
    { team: 'ATL', primary: '#A71930', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-atlanta-falcons-team-logo-2.png'  },
    { team: 'CAR', primary: '#0085CA', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-carolina-panthers-team-logo-2.png'  },
    { team: 'NO', primary: '#D3BC8D', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-orleans-saints-team-logo-2.png'  },
    { team: 'TBB', primary: '#D50A0A', secondary: '#FF7900', logo: 'https://loodibee.com/wp-content/uploads/tampa-bay-buccaneers-2020-logo.png'  },
    { team: 'ARI', primary: '#97233F', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-arizona-cardinals-team-logo-2.png' },
    { team: 'LAR', primary: '#003594', secondary: '#FFA300', logo: 'https://loodibee.com/wp-content/uploads/los-angeles-rams-2020-logo.png'  },
    { team: 'SF', primary: '#AA0000', secondary: '#B3995D', logo: 'https://loodibee.com/wp-content/uploads/nfl-san-francisco-49ers-team-logo-2.png'  },
    { team: 'SEA', primary: '#002244', secondary: '#69BE28', logo: 'https://loodibee.com/wp-content/uploads/nfl-seattle-seahawks-team-logo-2.png'  },

]