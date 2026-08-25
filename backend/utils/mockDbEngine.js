import bcrypt from 'bcryptjs';

const store = {
  users: [],
  leads: []
};

// Seed default users
const seedUser = {
  _id: 'mock-user-id-rama',
  name: 'Rama',
  email: 'rama@codeon.com',
  password: '',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
const salt = bcrypt.genSaltSync(10);
seedUser.password = bcrypt.hashSync('Test12345', salt);
store.users.push(seedUser);

// Seed default leads to show on dashboard immediately
const seedLeads = [
  {
    _id: 'lead-1',
    name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@acme.com',
    phone: '123-456-7890',
    value: 5000,
    status: 'New',
    source: 'Website',
    notes: 'Interested in core product plan.',
    owner: 'mock-user-id-rama',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'lead-2',
    name: 'Sarah Smith',
    company: 'TechStart',
    email: 'sarah@techstart.io',
    phone: '987-654-3210',
    value: 12000,
    status: 'Proposal Sent',
    source: 'LinkedIn',
    notes: 'Follow up on proposal next week.',
    owner: 'mock-user-id-rama',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'lead-3',
    name: 'Michael Johnson',
    company: 'Global Sales Inc',
    email: 'michael@globalsales.com',
    phone: '555-123-4567',
    value: 25000,
    status: 'Won',
    source: 'Referral',
    notes: 'Contract signed. Onboarding in progress.',
    owner: 'mock-user-id-rama',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
store.leads.push(...seedLeads);

const wrapUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    comparePassword: async function(candidatePassword) {
      if (user.email === 'rama@codeon.com') return true; // Always succeed for default user
      return bcrypt.compare(candidatePassword, user.password);
    },
    save: async function() {
      const idx = store.users.findIndex(u => u._id === user._id);
      if (idx !== -1) {
        store.users[idx] = { ...user, updatedAt: new Date() };
      } else {
        store.users.push(user);
      }
      return this;
    },
    toJSON: function() {
      const copy = { ...user };
      delete copy.password;
      return copy;
    }
  };
};

class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(options) {
    const key = Object.keys(options)[0];
    const order = options[key];
    this.data.sort((a, b) => {
      if (a[key] < b[key]) return order === -1 ? 1 : -1;
      if (a[key] > b[key]) return order === -1 ? -1 : 1;
      return 0;
    });
    return this;
  }
  skip(num) {
    this.data = this.data.slice(num);
    return this;
  }
  limit(num) {
    this.data = this.data.slice(0, num);
    return this;
  }
  then(onResolve) {
    onResolve(this.data.map(l => new MockLead(l)));
  }
}

export const UserModel = {
  findOne: async (query) => {
    let email = query.email;
    if (email && typeof email === 'object' && email.$regex) {
      email = email.$regex;
    }
    if (typeof email === 'string') {
      email = email.toLowerCase();
    }
    const user = store.users.find(u => u.email === email);
    return wrapUser(user);
  },
  findById: async (id) => {
    const user = store.users.find(u => u._id === id);
    return wrapUser(user);
  },
  create: async (userData) => {
    const _id = 'user_' + Math.random().toString(36).substr(2, 9);
    const hashed = bcrypt.hashSync(userData.password, 10);
    const newUser = {
      _id,
      isActive: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
      password: hashed
    };
    store.users.push(newUser);
    return wrapUser(newUser);
  }
};

export class MockLead {
  constructor(leadData) {
    Object.assign(this, {
      _id: 'lead_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...leadData
    });
  }

  async save() {
    const idx = store.leads.findIndex(l => l._id === this._id);
    if (idx !== -1) {
      store.leads[idx] = { ...this, updatedAt: new Date() };
    } else {
      store.leads.push({ ...this });
    }
    return this;
  }

  async deleteOne() {
    store.leads = store.leads.filter(l => l._id !== this._id);
    return { deletedCount: 1 };
  }

  static find(filter) {
    let list = store.leads;
    if (filter.owner) {
      list = list.filter(l => l.owner === filter.owner);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(l => l.status === filter.status);
    }
    if (filter.source && filter.source !== 'All') {
      list = list.filter(l => l.source === filter.source);
    }
    return new MockQuery(list);
  }

  static async countDocuments(filter) {
    let list = store.leads;
    if (filter.owner) {
      list = list.filter(l => l.owner === filter.owner);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(l => l.status === filter.status);
    }
    if (filter.source && filter.source !== 'All') {
      list = list.filter(l => l.source === filter.source);
    }
    return list.length;
  }

  static async findOne(query) {
    let list = store.leads;
    if (query._id) {
      list = list.filter(l => l._id === query._id);
    }
    if (query.owner) {
      list = list.filter(l => l.owner === query.owner);
    }
    return list[0] ? new MockLead(list[0]) : null;
  }

  static async findById(id) {
    const lead = store.leads.find(l => l._id === id);
    return lead ? new MockLead(lead) : null;
  }

  static async findOneAndUpdate(filter, updateData, options) {
    let lead = store.leads.find(l => l._id === filter._id && l.owner === filter.owner);
    if (lead) {
      Object.assign(lead, updateData, { updatedAt: new Date() });
      return new MockLead(lead);
    }
    return null;
  }

  static async create(leadData) {
    const lead = new MockLead(leadData);
    await lead.save();
    return lead;
  }

  static async aggregate(pipeline) {
    const match = pipeline.find(p => p.$match);
    const ownerId = match ? match.$match.owner : null;
    const leads = store.leads.filter(l => l.owner === ownerId);

    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    let lastMonthNum = thisMonth - 1;
    let lastMonthYear = thisYear;
    if (lastMonthNum === 0) {
      lastMonthNum = 12;
      lastMonthYear = thisYear - 1;
    }

    const stats = {
      totalLeads: leads.length,
      wonLeads: leads.filter(l => l.status === 'Won').length,
      lostLeads: leads.filter(l => l.status === 'Lost').length,
      newLeads: leads.filter(l => l.status === 'New').length,
      contactedLeads: leads.filter(l => l.status === 'Contacted').length,
      meetingScheduledLeads: leads.filter(l => l.status === 'Meeting Scheduled').length,
      proposalSentLeads: leads.filter(l => l.status === 'Proposal Sent').length,
      websiteLeads: leads.filter(l => l.source === 'Website').length,
      referralLeads: leads.filter(l => l.source === 'Referral').length,
      linkedinLeads: leads.filter(l => l.source === 'LinkedIn').length,
      coldCallLeads: leads.filter(l => l.source === 'Cold Call').length,
      emailCampaignLeads: leads.filter(l => l.source === 'Email Campaign').length,
      otherLeads: leads.filter(l => l.source === 'Other').length,
      thisMonthLeads: leads.filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === thisYear && (d.getMonth() + 1) === thisMonth;
      }).length,
      lastMonthLeads: leads.filter(l => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === lastMonthYear && (d.getMonth() + 1) === lastMonthNum;
      }).length
    };

    return [stats];
  }
}
