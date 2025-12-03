import { prisma } from '../config/prisma';

export async function createFeedPost(data: {
  type: 'ORG_ANNOUNCEMENT' | 'CAMPAIGN';
  headline: string;
  body: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatarUrl?: string;
  authorOrg?: string;
  brand?: string;
  brandLogoUrl?: string;
  objective?: string;
  campaignStatus?: 'planning' | 'live' | 'wrapped';
  campaignId?: string;
  organizationId?: string;
  athleteId?: string;
  isOpen?: boolean;
}) {
  return await prisma.feedPost.create({
    data: {
      type: data.type,
      headline: data.headline,
      body: data.body,
      tags: data.tags,
      authorName: data.authorName,
      authorRole: data.authorRole,
      authorAvatarUrl: data.authorAvatarUrl || null,
      authorOrg: data.authorOrg || null,
      brand: data.brand || null,
      brandLogoUrl: data.brandLogoUrl || null,
      objective: data.objective || null,
      campaignStatus: data.campaignStatus || null,
      campaignId: data.campaignId || null,
      organizationId: data.organizationId || null,
      athleteId: data.athleteId || null,
      isOpen: data.isOpen || null,
    },
  });
}

export async function createAthleteCampaignPost(data: {
  athleteId: string;
  athleteName: string;
  athleteAvatarUrl?: string;
  campaignId: string;
  campaignTitle: string;
  organizationName: string;
  organizationId: string;
  organizationLogoUrl?: string;
  campaignType: string;
  earnings?: number;
}) {
  const earningsText = data.earnings 
    ? ` with earnings of $${data.earnings.toLocaleString()}` 
    : '';
  
  return await prisma.feedPost.create({
    data: {
      type: 'CAMPAIGN',
      headline: `🎉 ${data.athleteName} selected for ${data.organizationName} campaign!`,
      body: `Congratulations to ${data.athleteName} for being selected to participate in "${data.campaignTitle}" with ${data.organizationName}! This ${data.campaignType.toLowerCase().replace('_', ' ')} campaign${earningsText ? earningsText : ''} represents an exciting NIL opportunity. We're proud to support our athletes in building their brand and creating meaningful partnerships.`,
      tags: ['Campaign', 'Athlete Spotlight', data.organizationName, data.athleteName],
      authorName: 'BlueBloods NIL Desk',
      authorRole: 'Org NIL & Partnerships',
      authorAvatarUrl: 'https://placehold.co/64x64',
      authorOrg: 'BlueBloods Select',
      brand: data.organizationName,
      brandLogoUrl: data.organizationLogoUrl || 'https://placehold.co/56x56',
      objective: `Celebrating ${data.athleteName}'s selection for ${data.campaignTitle}`,
      campaignStatus: 'live',
      campaignId: data.campaignId,
      organizationId: data.organizationId,
      athleteId: data.athleteId,
      isOpen: false,
    },
  });
}

export async function createCampaignRecapPost(data: {
  campaignId: string;
  campaignTitle: string;
  organizationName: string;
  organizationId: string;
  organizationLogoUrl?: string;
  verificationContent: Array<{
    athleteName: string;
    verificationUrl?: string;
    verificationNotes?: string;
  }>;
  totalEarnings?: number;
  participants: Array<{
    athleteName: string;
    earnings?: number;
  }>;
}) {
  // Build recap body with verification content and earnings
  let recapBody = `Campaign Recap: ${data.campaignTitle}\n\n`;
  
  if (data.verificationContent.length > 0) {
    recapBody += 'Verification Submissions:\n';
    data.verificationContent.forEach((item, index) => {
      recapBody += `\n${index + 1}. ${item.athleteName}:\n`;
      if (item.verificationUrl) {
        recapBody += `   Link: ${item.verificationUrl}\n`;
      }
      if (item.verificationNotes) {
        recapBody += `   Notes: ${item.verificationNotes}\n`;
      }
    });
    recapBody += '\n';
  }

  if (data.totalEarnings) {
    recapBody += `Total Earnings: $${data.totalEarnings.toLocaleString()}\n\n`;
    if (data.participants.length > 0) {
      recapBody += 'Earnings Breakdown:\n';
      data.participants.forEach(participant => {
        const earnings = participant.earnings ? `$${participant.earnings.toLocaleString()}` : 'N/A';
        recapBody += `• ${participant.athleteName}: ${earnings}\n`;
      });
    }
  }

  return await prisma.feedPost.create({
    data: {
      type: 'CAMPAIGN',
      headline: `Campaign Complete: ${data.campaignTitle}`,
      body: recapBody,
      tags: ['Campaign', 'Recap', data.organizationName],
      authorName: data.organizationName,
      authorRole: 'Partner Brand',
      authorAvatarUrl: data.organizationLogoUrl || 'https://placehold.co/64x64',
      authorOrg: data.organizationName,
      brand: data.organizationName,
      brandLogoUrl: data.organizationLogoUrl || 'https://placehold.co/56x56',
      objective: recapBody,
      campaignStatus: 'wrapped',
      campaignId: data.campaignId,
      organizationId: data.organizationId,
      isOpen: false,
    },
  });
}

