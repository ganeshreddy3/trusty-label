import { 
  ExtractedDetails, 
  VerificationResult, 
  VerificationCheck,
  ProductStatus 
} from '@/types/product';
import { 
  validateFSSAILicense, 
  isBlacklisted 
} from '@/data/mockDatabase';

export function verifyProduct(details: ExtractedDetails): VerificationResult {
  const checks: VerificationCheck[] = [];
  let totalScore = 0;
  let maxScore = 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check FSSAI License
  if (details.licenseNumber) {
    maxScore += 30;
    const license = validateFSSAILicense(details.licenseNumber);
    
    if (license) {
      if (license.status === 'active') {
        totalScore += 30;
        checks.push({
          name: "FSSAI License",
          passed: true,
          message: `Valid license from ${license.companyName}`,
          severity: "info"
        });
      } else if (license.status === 'expired') {
        totalScore += 10;
        checks.push({
          name: "FSSAI License",
          passed: false,
          message: `License expired on ${license.validUntil}`,
          severity: "warning"
        });
        warnings.push("FSSAI license has expired. Product may not meet current safety standards.");
      } else {
        checks.push({
          name: "FSSAI License",
          passed: false,
          message: "License has been revoked",
          severity: "error"
        });
        warnings.push("CRITICAL: This manufacturer's license has been revoked!");
      }
    } else {
      checks.push({
        name: "FSSAI License",
        passed: false,
        message: "License number not found in database",
        severity: "error"
      });
      warnings.push("Could not verify FSSAI license. This product may be counterfeit.");
    }
  }

  // Check Manufacturer
  if (details.manufacturer) {
    maxScore += 20;
    if (isBlacklisted(details.manufacturer)) {
      checks.push({
        name: "Manufacturer Check",
        passed: false,
        message: "Manufacturer is on the blacklist",
        severity: "error"
      });
      warnings.push("WARNING: This manufacturer has been blacklisted for selling fake products!");
    } else {
      totalScore += 20;
      checks.push({
        name: "Manufacturer Check",
        passed: true,
        message: "Manufacturer is not blacklisted",
        severity: "info"
      });
    }
  }

  // Check Batch Number Format
  if (details.batchNumber) {
    maxScore += 15;
    const batchPattern = /^[A-Z]{2,4}\d{4}[A-Z]?\d{2,4}$/;
    if (batchPattern.test(details.batchNumber)) {
      totalScore += 15;
      checks.push({
        name: "Batch Number",
        passed: true,
        message: "Valid batch number format",
        severity: "info"
      });
    } else {
      totalScore += 5;
      checks.push({
        name: "Batch Number",
        passed: false,
        message: "Batch number format is unusual",
        severity: "warning"
      });
    }
  }

  // Check License Date
  if (details.licenseDate) {
    maxScore += 20;
    const licenseDate = new Date(details.licenseDate);
    const today = new Date();
    const daysSinceLicense = Math.floor((today.getTime() - licenseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLicense <= 365) {
      totalScore += 20;
      checks.push({
        name: "License Date",
        passed: true,
        message: `License issued ${daysSinceLicense} days ago`,
        severity: "info"
      });
    } else if (daysSinceLicense <= 730) {
      totalScore += 10;
      checks.push({
        name: "License Date",
        passed: true,
        message: `License issued ${Math.floor(daysSinceLicense / 365)} year(s) ago`,
        severity: "warning"
      });
      recommendations.push("License is over a year old. Consider verifying renewal status.");
    } else {
      checks.push({
        name: "License Date",
        passed: false,
        message: "License is outdated (over 2 years old)",
        severity: "error"
      });
      warnings.push("WARNING: License date is very old. Verify if license has been renewed.");
    }
  }

  // Check for missing FSSAI license
  if (!details.licenseNumber) {
    maxScore += 15;
    checks.push({
      name: "FSSAI License Missing",
      passed: false,
      message: "No FSSAI license number found on the product",
      severity: "error"
    });
    warnings.push("No FSSAI license found. All packaged food products in India must have a valid FSSAI license.");
  }

  // Calculate final trust score
  const trustScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Determine status
  let status: ProductStatus;
  if (trustScore >= 80) {
    status = 'genuine';
    recommendations.push("This product appears to be genuine based on our verification checks.");
  } else if (trustScore >= 50) {
    status = 'suspicious';
    recommendations.push("Exercise caution. Some verification checks did not pass.");
  } else {
    status = 'fake';
    recommendations.push("HIGH RISK: This product failed multiple verification checks. Do not purchase.");
  }

  // Add general recommendations
  if (status !== 'fake') {
    recommendations.push("Always purchase from authorized retailers.");
    recommendations.push("Report any suspicious products to help protect other consumers.");
  }

  return {
    isValid: status === 'genuine',
    trustScore,
    status,
    checks,
    recommendations,
    warnings
  };
}
