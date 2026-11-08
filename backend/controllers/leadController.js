import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

/**
 * Retrieves all leads owned by the authenticated user with advanced filters, search, sorting, and pagination.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @returns {Promise<Object>} Paginated JSON response with data array and pagination metadata.
 */
export const getLeads = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status, 
      search, 
      source,
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skipNum = (pageNum - 1) * limitNum;

    // Filter object - isolation: always scope queries to the current user
    const filter = { owner: req.user._id };

    // Apply Filter: status (ignoring 'All' if passed, otherwise use exact status)
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Apply Filter: source (ignoring 'All' if passed)
    if (source && source !== 'All') {
      filter.source = source;
    }

    // Apply Filter: search using case-insensitive regex
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Apply Filter: dateFrom / dateTo (createdAt range check)
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Determine sorting direction
    const sortOptions = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1
    };

    // Fetch matching records and total counts concurrently
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortOptions)
        .skip(skipNum)
        .limit(limitNum),
      Lead.countDocuments(filter)
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new lead owned by the authenticated user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Fields for the new lead.
 * @returns {Promise<Object>} Successful JSON response with the created lead details.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes, value } = req.body;

    // Create lead with owner set to current logged-in user
    const lead = new Lead({
      name: name?.trim(),
      company: company?.trim(),
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      value: value ? Number(value) : 0,
      status: status || 'New',
      source: source || 'Website',
      notes: notes?.trim(),
      owner: req.user._id
    });

    await lead.save();

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single lead details by ID, ensuring owner authorization.
 */
export const getLeadById = async (req, res, next) => {
  try {
    const leadId = req.params.id;

    const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing lead, verifying owner authorization.
 */
export const updateLead = async (req, res, next) => {
  try {
    const leadId = req.params.id;

    // Prevent ownership transfer
    const updateData = { ...req.body };
    delete updateData.owner;

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.company) {
      updateData.company = updateData.company.trim();
    }
    if (updateData.value !== undefined) {
      updateData.value = Number(updateData.value) || 0;
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, owner: req.user._id },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Fast-updates the pipeline status of a single lead.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const leadId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, owner: req.user._id },
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a lead, verifying owner authorization.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const leadId = req.params.id;

    const lead = await Lead.findOne({ _id: leadId, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregates complete lead statistics for the authenticated user in a single database query.
 * Computes totals, pipeline value, status breakdown, conversion rates, source breakdown, monthly leads, and growth rate.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1; // 1-12
    
    let lastMonthNum = thisMonth - 1;
    let lastMonthYear = thisYear;
    if (lastMonthNum === 0) {
      lastMonthNum = 12;
      lastMonthYear = thisYear - 1;
    }

    const stats = await Lead.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$value', 0] } },
          // Status counts
          wonLeads: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
          lostLeads: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
          newLeads: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
          contactedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
          meetingScheduledLeads: { $sum: { $cond: [{ $eq: ['$status', 'Meeting Scheduled'] }, 1, 0] } },
          proposalSentLeads: { $sum: { $cond: [{ $eq: ['$status', 'Proposal Sent'] }, 1, 0] } },
          // Source counts
          websiteLeads: { $sum: { $cond: [{ $eq: ['$source', 'Website'] }, 1, 0] } },
          referralLeads: { $sum: { $cond: [{ $eq: ['$source', 'Referral'] }, 1, 0] } },
          linkedinLeads: { $sum: { $cond: [{ $eq: ['$source', 'LinkedIn'] }, 1, 0] } },
          coldCallLeads: { $sum: { $cond: [{ $eq: ['$source', 'Cold Call'] }, 1, 0] } },
          emailCampaignLeads: { $sum: { $cond: [{ $eq: ['$source', 'Email Campaign'] }, 1, 0] } },
          otherLeads: { $sum: { $cond: [{ $eq: ['$source', 'Other'] }, 1, 0] } },
          // Monthly comparisons
          thisMonthLeads: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $year: '$createdAt' }, thisYear] },
                    { $eq: [{ $month: '$createdAt' }, thisMonth] }
                  ]
                },
                1,
                0
              ]
            }
          },
          lastMonthLeads: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $year: '$createdAt' }, lastMonthYear] },
                    { $eq: [{ $month: '$createdAt' }, lastMonthNum] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    let data;

    if (stats.length === 0) {
      data = {
        totalLeads: 0,
        totalValue: 0,
        statusBreakdown: {
          New: 0,
          Contacted: 0,
          'Meeting Scheduled': 0,
          'Proposal Sent': 0,
          Won: 0,
          Lost: 0
        },
        conversionRate: 0.0,
        sourceBreakdown: {
          Website: 0,
          Referral: 0,
          LinkedIn: 0,
          'Cold Call': 0,
          'Email Campaign': 0,
          Other: 0
        },
        thisMonthLeads: 0,
        lastMonthLeads: 0,
        growthRate: 0.0
      };
    } else {
      const doc = stats[0];
      const totalLeads = doc.totalLeads || 0;
      const totalValue = doc.totalValue || 0;
      const wonLeads = doc.wonLeads || 0;
      
      const statusBreakdown = {
        New: doc.newLeads || 0,
        Contacted: doc.contactedLeads || 0,
        'Meeting Scheduled': doc.meetingScheduledLeads || 0,
        'Proposal Sent': doc.proposalSentLeads || 0,
        Won: wonLeads,
        Lost: doc.lostLeads || 0
      };

      const sourceBreakdown = {
        Website: doc.websiteLeads || 0,
        Referral: doc.referralLeads || 0,
        LinkedIn: doc.linkedinLeads || 0,
        'Cold Call': doc.coldCallLeads || 0,
        'Email Campaign': doc.emailCampaignLeads || 0,
        Other: doc.otherLeads || 0
      };

      const conversionRate = totalLeads > 0 
        ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1)) 
        : 0.0;

      const thisMonthLeads = doc.thisMonthLeads || 0;
      const lastMonthLeads = doc.lastMonthLeads || 0;

      let growthRate = 0.0;
      if (lastMonthLeads > 0) {
        growthRate = parseFloat((((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1));
      } else if (thisMonthLeads > 0) {
        growthRate = 100.0;
      }

      data = {
        totalLeads,
        totalValue,
        statusBreakdown,
        conversionRate,
        sourceBreakdown,
        thisMonthLeads,
        lastMonthLeads,
        growthRate
      };
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggregates monthly lead totals, won, lost, and conversion rate metrics for the last 6 months chronologically.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const stats = await Lead.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          won: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Won'] }, 1, 0]
            }
          },
          lost: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const monthLabel = `${monthNames[d.getMonth()]} ${year}`;

      const matchedStats = stats.find(
        (s) => s._id.year === year && s._id.month === monthNum
      );

      const total = matchedStats ? matchedStats.total : 0;
      const won = matchedStats ? matchedStats.won : 0;
      const lost = matchedStats ? matchedStats.lost : 0;
      const conversionRate = total > 0 ? parseFloat(((won / total) * 100).toFixed(1)) : 0.0;

      result.push({
        month: monthLabel,
        total,
        won,
        lost,
        conversionRate
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fast search/autocomplete endpoint for leads.
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 5, 20);

    if (!q) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const searchRegex = new RegExp(q, 'i');

    const leads = await Lead.find({
      owner: req.user._id,
      $or: [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('_id name company email status value')
    .limit(limitNum);

    return res.status(200).json({
      success: true,
      data: leads
    });
  } catch (error) {
    next(error);
  }
};
