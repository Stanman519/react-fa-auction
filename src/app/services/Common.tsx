import { profileEnd } from "console";
import Owner, { LeagueLoginInfo } from "../redux/reducers/OwnerReducer";

interface OwnerLookup{
    name: string
    id: number
    avatar: string
}

interface TmColor{
    team: string
    nickname: string
    primary: string
    secondary: string
    text?: string
    logo: string
}

export interface BidValidity{
    isValid: boolean
    violations: string[]
}

const file = process.env.PUBLIC_URL + '/avatars/';

export const lastYear = 2022;


export const checkValidity = (league: LeagueLoginInfo, newBid: number, newYears: number, mflId: number, oldBid: number = 0, oldYears: number = 0, bidsOnBoard: number = 0): BidValidity => {
    let validity: BidValidity = { isValid: true, violations: [] } 
    if(!league){
        validity.isValid = false;
        validity.violations.push("You are not logged in.")
    }
    if((newBid + bidsOnBoard) > league.capRoom ){
        validity.isValid = false
        validity.violations.push("This and your current high bids would put you over the cap.")
    }
    if(newYears > 5) {
        validity.isValid = false
        validity.violations.push("Contracts are 5 year max.");
    }
    if(newBid > 475) {
        validity.isValid = false
        validity.violations.push("Salary too high for cap.");
    }
    if(newBid < 1 || newBid % 1 > 0 || newYears < 1 ) {
        validity.isValid = false
        validity.violations.push("Salary and years must be whole numbers over 0.");
    }
    if(newBid=== 1 && newYears > 1) {
        validity.isValid = false
        validity.violations.push("$1 salaries must be 1 year.");
    }
    if(newBid < 20 && newYears > 2) {
        validity.isValid = false
        validity.violations.push("Salaries under $20 can only go up to 2 years.");
    }
    if(newBid < 35 && newYears > 3) {
        validity.isValid = false
        validity.violations.push("Salaries under $35 can only go up to 3 years.");
    }
    if(!mflId) {
        validity.isValid = false
        validity.violations.push("You must choose a player before bidding.");
    }
    if(newBid + (newYears * 5) <= oldBid + (oldYears * 5)) {
        validity.isValid = false
        let old = oldBid + (oldYears * 5)
        let newB = newBid + (newYears * 5)
        validity.violations.push(`Old bid contract value: ${old}. Yours: ${newB} (Years x 5 + salary)`);
    }
    
    // this.currentUser.capRoom >= newBid &&
    // this.currentUser.yearsLeft >= newYears &&
    // newBid <= this.currentUser.capRoom &&
    // newYears <= this.currentUser.yearsLeft
    return validity;
}

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
    { team: 'BAL', nickname: 'Ravens', primary: '#241773', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-baltimore-ravens-team-logo-2.png' },
    { team: 'CIN', nickname: 'Bengals',primary: '#FB4F14', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-cincinnati-bengals-team-logo.png'  },
    { team: 'CLE', nickname: 'Browns', primary: '#311D00', secondary: '#FF3C00', logo: 'https://loodibee.com/wp-content/uploads/nfl-cleveland-browns-team-logo-2.png'  },
    { team: 'PIT', nickname: 'Steelers', primary: '#FFB612', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-pittsburgh-steelers-team-logo-2.png'  },
    { team: 'BUF', nickname: 'Bills', primary: '#00338D', secondary: '#C60C30', logo: 'https://loodibee.com/wp-content/uploads/nfl-buffalo-bills-team-logo-2.png'  },
    { team: 'MIA', nickname: 'Dolphins', primary: '#008E97', secondary: '#FC4C02', logo: 'https://loodibee.com/wp-content/uploads/nfl-miami-dolphins-logo-2018.png'  },
    { team: 'NEP', nickname: 'Patriots', primary: '#002244', secondary: '#C60C30', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-england-patriots-team-logo-2.png'  },
    { team: 'NYJ', nickname: 'Jets', primary: '#125740', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-york-jets-team-logo.png'  },
    { team: 'HOU', nickname: 'Texans', primary: '#03202F', secondary: '#A71930', logo: 'https://loodibee.com/wp-content/uploads/nfl-houston-texans-team-logo-2.png'  },
    { team: 'IND', nickname: 'Colts', primary: '#002C5F', secondary: '#A2AAAD', logo: 'https://loodibee.com/wp-content/uploads/nfl-indianapolis-colts-team-logo-2.png'  },
    { team: 'JAC', nickname: 'Jaguars', primary: '#101820', secondary: '#D7A22A', logo: 'https://loodibee.com/wp-content/uploads/nfl-jacksonville-jaguars-team-logo-2.png'  },
    { team: 'TEN', nickname: 'Titans', primary: '#0C2340', secondary: '#4B92DB', logo: 'https://loodibee.com/wp-content/uploads/nfl-tennessee-titans-team-logo-2.png'  },
    { team: 'DEN', nickname: 'Broncos', primary: '#FB4F14', secondary: '#002244', logo: 'https://loodibee.com/wp-content/uploads/nfl-denver-broncos-team-logo-2.png'  },
    { team: 'KCC', nickname: 'Chiefs', primary: '#E31837', secondary: '#FFB81C', logo: 'https://loodibee.com/wp-content/uploads/nfl-kansas-city-chiefs-team-logo-2.png'  },
    { team: 'LVR', nickname: 'Raiders', primary: '#000000', secondary: '#A5ACAF', logo: 'https://loodibee.com/wp-content/uploads/nfl-oakland-raiders-team-logo.png'  },
    { team: 'LAC', nickname: 'Chargers', primary: '#0080C6', secondary: '#FFC20E', logo: 'https://loodibee.com/wp-content/uploads/nfl-los-angeles-chargers-team-logo-2.png'  },
    { team: 'CHI', nickname: 'Bears', primary: '#0B162A', secondary: '#C83803', logo: 'https://loodibee.com/wp-content/uploads/nfl-chicago-bears-team-logo-2.png'  },
    { team: 'DET', nickname: 'Lions', primary: '#0076B6', secondary: '#B0B7BC', logo: 'https://loodibee.com/wp-content/uploads/nfl-detroit-lions-team-logo-2.png'  },
    { team: 'GBP', nickname: 'Packers', primary: '#203731', secondary: '#FFB612', logo: 'https://loodibee.com/wp-content/uploads/nfl-green-bay-packers-team-logo-2.png'  },
    { team: 'MIN', nickname: 'Vikings', primary: '#4F2683', secondary: '#FFC62F', logo: 'https://loodibee.com/wp-content/uploads/nfl-minnesota-vikings-team-logo-2.png'  },
    { team: 'DAL', nickname: 'Cowboys', primary: '#003594', secondary: '#041E42', logo: 'https://loodibee.com/wp-content/uploads/nfl-dallas-cowboys-team-logo-2.png'  },
    { team: 'NYG', nickname: 'Giants', primary: '#0B2265', secondary: '#A71930', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-york-giants-team-logo-2.png'  },
    { team: 'PHI', nickname: 'Eagles', primary: '#004C54', secondary: '#A5ACAF', logo: 'https://loodibee.com/wp-content/uploads/nfl-philadelphia-eagles-team-logo-2.png'  },
    { team: 'WAS', nickname: 'Commanders (lol?)', primary: '#5A1414', secondary: '#FFB612', logo: 'https://loodibee.com/wp-content/uploads/washington-commanders-logo.png'  },
    { team: 'ATL', nickname: 'Falcons', primary: '#A71930', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-atlanta-falcons-team-logo-2.png'  },
    { team: 'CAR', nickname: 'Panthers',  primary: '#0085CA', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-carolina-panthers-team-logo-2.png'  },
    { team: 'NOS', nickname: 'Saints', primary: '#D3BC8D', secondary: '#101820', logo: 'https://loodibee.com/wp-content/uploads/nfl-new-orleans-saints-team-logo-2.png'  },
    { team: 'TBB', nickname: 'Buccaneers',  primary: '#D50A0A', secondary: '#FF7900', logo: 'https://loodibee.com/wp-content/uploads/tampa-bay-buccaneers-2020-logo.png'  },
    { team: 'ARI', nickname: 'Cardinals', primary: '#97233F', secondary: '#000000', logo: 'https://loodibee.com/wp-content/uploads/nfl-arizona-cardinals-team-logo-2.png' },
    { team: 'LAR', nickname: 'Rams', primary: '#003594', secondary: '#FFA300', logo: 'https://loodibee.com/wp-content/uploads/los-angeles-rams-2020-logo.png'  },
    { team: 'SFO', nickname: '49ers', primary: '#AA0000', secondary: '#B3995D', logo: 'https://loodibee.com/wp-content/uploads/nfl-san-francisco-49ers-team-logo-2.png'  },
    { team: 'SEA', nickname: 'Seahawks', primary: '#002244', secondary: '#69BE28', logo: 'https://loodibee.com/wp-content/uploads/nfl-seattle-seahawks-team-logo-2.png'  },
    { team: 'FA', nickname: 'Free Agent', primary: 'gray', secondary: 'black', logo: 'https://loodibee.com/wp-content/uploads/nfl-league-logo.png'}

]

export const getRankStringSuffix = (i: number) =>  {
    if (!i) return "-"
    var j = i % 10,
        k = i % 100;
    if (j=== 1 && k !== 11) {
        return i + "st";
    }
    if (j=== 2 && k !== 12) {
        return i + "nd";
    }
    if (j=== 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}