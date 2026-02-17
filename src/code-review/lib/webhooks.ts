import { Review } from './types';

export interface WebhookPayload {
  event: string;
  data: {
    reviewId?: string;
    reviewName?: string;
    repoUrl?: string;
    score?: number;
    totalIssues?: number;
    categories?: Record<string, number>;
    issues?: Review['issues'];
    timestamp?: string;
    date?: string;
    error?: string;
    message?: string;
  };
  timestamp: string;
}

export class WebhookService {
  static async sendWebhook(
    url: string,
    payload: WebhookPayload
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodeGuardian/1.0.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Webhook sent:', payload.event, 'to:', url);
    } catch (error) {
      console.error('❌ Webhook error:', error);
    }
  }

  private static getWebhookUrl(webhookUrl?: string): string {
    if (webhookUrl) return webhookUrl;
    const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WEBHOOK_URL) || '';
    return envUrl || '';
  }

  static async sendGitHubAnalysisComplete(
    review: Review,
    webhookUrl?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: 'analysis_complete',
      data: {
        reviewId: review.id,
        reviewName: review.name,
        repoUrl: review.repoUrl,
        score: review.score,
        totalIssues: review.totalIssues,
        categories: review.categories,
        issues: review.issues,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const url = this.getWebhookUrl(webhookUrl);
    
    if (url) {
      await this.sendWebhook(url, payload);
    }
  }

  static async sendReviewCreated(
    review: Review,
    webhookUrl?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: 'review_created',
      data: {
        reviewId: review.id,
        reviewName: review.name,
        score: review.score,
        totalIssues: review.totalIssues,
        categories: review.categories,
        issues: review.issues,
        date: review.date,
      },
      timestamp: new Date().toISOString(),
    };

    const url = this.getWebhookUrl(webhookUrl);
    
    if (url) {
      await this.sendWebhook(url, payload);
    }
  }

  static async sendAnalysisStarted(
    repoUrl: string,
    webhookUrl?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: 'analysis_started',
      data: {
        repoUrl,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const url = this.getWebhookUrl(webhookUrl);
    
    if (url) {
      await this.sendWebhook(url, payload);
    }
  }

  static async sendPRReviewComplete(
    prUrl: string,
    prNumber: number,
    prTitle: string,
    score: number,
    totalIssues: number,
    filesReviewed: number,
    additions: number,
    deletions: number,
    comments: { file: string; line: number; text: string; severity: string }[],
    webhookUrl?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: 'pr_review_complete',
      data: {
        repoUrl: prUrl,
        reviewName: `PR #${prNumber}: ${prTitle}`,
        score,
        totalIssues,
        message: `Reviewed ${filesReviewed} files: +${additions} -${deletions}`,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const url = this.getWebhookUrl(webhookUrl);
    if (url) {
      await this.sendWebhook(url, payload);
    }
  }

  static async sendError(
    error: Error,
    webhookUrl?: string
  ): Promise<void> {
    const payload: WebhookPayload = {
      event: 'analysis_failed',
      data: {
        error: error.message,
        repoUrl: '',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    const url = this.getWebhookUrl(webhookUrl);
    
    if (url) {
      await this.sendWebhook(url, payload);
    }
  }
}

export const webhookService = new WebhookService();