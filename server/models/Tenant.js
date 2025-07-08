import crypto from 'crypto';

import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    title: {
      type: String,
      enum: ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Rev', 'Other'],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, 'Middle name cannot exceed 50 characters'],
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: [50, 'Preferred name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function (value) {
          const today = new Date();
          const age = Math.floor((today - value) / (365.25 * 24 * 60 * 60 * 1000));
          return age >= 18; // Must be at least 18 years old
        },
        message: 'Tenant must be at least 18 years old',
      },
    },
    nationalInsuranceNumber: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: [13, 'National Insurance Number cannot exceed 13 characters'],
      match: [
        /^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$/,
        'Please provide a valid UK National Insurance Number',
      ],
    },
    passportNumber: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: [20, 'Passport number cannot exceed 20 characters'],
    },
    drivingLicenceNumber: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: [16, 'UK driving licence number cannot exceed 16 characters'],
      match: [
        /^[A-Z]{1,5}[0-9]{6}[A-Z]{0,3}[0-9]{2}$/,
        'Please provide a valid UK driving licence number',
      ],
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [50, 'Nationality cannot exceed 50 characters'],
      default: 'British',
    },
    immigrationStatus: {
      type: String,
      enum: [
        'british-citizen',
        'british-national',
        'irish-citizen',
        'eu-settled-status',
        'eu-pre-settled-status',
        'indefinite-leave-to-remain',
        'work-visa',
        'student-visa',
        'spouse-visa',
        'family-visa',
        'refugee-status',
        'other',
      ],
      default: 'british-citizen',
    },
    rightToRent: {
      verified: {
        type: Boolean,
        default: false,
        required: [true, 'Right to rent verification is mandatory'],
      },
      verificationDate: {
        type: Date,
      },
      documentType: {
        type: String,
        enum: [
          'uk-passport',
          'eu-passport',
          'other-passport',
          'uk-driving-licence',
          'birth-certificate',
          'brp-card',
          'visa',
          'settlement-document',
          'other',
        ],
      },
      documentExpiryDate: {
        type: Date,
      },
      recheckRequired: {
        type: Boolean,
        default: false,
      },
      recheckDate: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Right to rent notes cannot exceed 500 characters'],
      },
    },
  },

  // Contact Information
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      primary: {
        number: {
          type: String,
          required: [true, 'Primary phone number is required'],
          trim: true,
          match: [/^(07\d{9}|0\d{10}|\+44\d{10})$/, 'Please provide a valid UK phone number'],
        },
        type: {
          type: String,
          enum: ['mobile', 'home', 'work'],
          default: 'mobile',
        },
      },
      secondary: {
        number: {
          type: String,
          trim: true,
          match: [/^(07\d{9}|0\d{10}|\+44\d{10})$/, 'Please provide a valid UK phone number'],
        },
        type: {
          type: String,
          enum: ['mobile', 'home', 'work'],
        },
      },
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters'],
        enum: [
          'parent',
          'sibling',
          'spouse',
          'partner',
          'child',
          'relative',
          'friend',
          'colleague',
          'other',
        ],
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required'],
        trim: true,
        match: [
          /^(\+44\s?)?(\(?0\d{4}\)?\s?\d{6}|\(?0\d{3}\)?\s?\d{7}|\(?0\d{2}\)?\s?\d{8}|07\d{9})$/,
          'Please provide a valid UK phone number',
        ],
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid emergency contact email'],
      },
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Emergency contact address cannot exceed 200 characters'],
      },
    },
  },

  // Address Information
  addresses: {
    current: {
      addressLine1: {
        type: String,
        trim: true,
        maxlength: [200, 'Address line 1 cannot exceed 200 characters'],
      },
      addressLine2: {
        type: String,
        trim: true,
        maxlength: [200, 'Address line 2 cannot exceed 200 characters'],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters'],
      },
      county: {
        type: String,
        trim: true,
        maxlength: [100, 'County cannot exceed 100 characters'],
      },
      postcode: {
        type: String,
        trim: true,
        maxlength: [10, 'Postcode cannot exceed 10 characters'],
        match: [
          /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i,
          'Please provide a valid UK postcode',
        ],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'United Kingdom',
        trim: true,
        maxlength: [100, 'Country cannot exceed 100 characters'],
      },
    },
    previous: [
      {
        addressLine1: {
          type: String,
          trim: true,
          maxlength: [200, 'Address line 1 cannot exceed 200 characters'],
        },
        addressLine2: {
          type: String,
          trim: true,
          maxlength: [200, 'Address line 2 cannot exceed 200 characters'],
        },
        city: {
          type: String,
          trim: true,
          maxlength: [100, 'City cannot exceed 100 characters'],
        },
        county: {
          type: String,
          trim: true,
          maxlength: [100, 'County cannot exceed 100 characters'],
        },
        postcode: {
          type: String,
          trim: true,
          maxlength: [10, 'Postcode cannot exceed 10 characters'],
        },
        country: {
          type: String,
          trim: true,
          maxlength: [100, 'Country cannot exceed 100 characters'],
          default: 'United Kingdom',
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        landlordName: {
          type: String,
          trim: true,
          maxlength: [100, 'Landlord name cannot exceed 100 characters'],
        },
        landlordPhone: {
          type: String,
          trim: true,
        },
        monthlyRent: {
          type: Number,
          min: [0, 'Monthly rent cannot be negative'],
        },
        currency: {
          type: String,
          default: 'GBP',
          maxlength: [3, 'Currency code must be 3 characters'],
        },
        payFrequency: {
          type: String,
          enum: ['weekly', 'monthly', 'annually'],
          default: 'monthly',
        },
        reasonForLeaving: {
          type: String,
          trim: true,
          maxlength: [500, 'Reason for leaving cannot exceed 500 characters'],
        },
      },
    ],
  },

  // Employment Information
  employment: {
    current: {
      status: {
        type: String,
        enum: [
          'employed-full-time',
          'employed-part-time',
          'self-employed',
          'unemployed',
          'student',
          'retired',
          'on-benefits',
          'contractor',
          'apprentice',
          'other',
        ],
        required: [true, 'Employment status is required'],
      },
      employer: {
        name: {
          type: String,
          trim: true,
          maxlength: [200, 'Employer name cannot exceed 200 characters'],
        },
        position: {
          type: String,
          trim: true,
          maxlength: [100, 'Position cannot exceed 100 characters'],
        },
        contractType: {
          type: String,
          enum: ['permanent', 'fixed-term', 'zero-hours', 'casual', 'agency', 'apprenticeship'],
        },
        startDate: {
          type: Date,
        },
        address: {
          addressLine1: {
            type: String,
            trim: true,
            maxlength: [200, 'Address line 1 cannot exceed 200 characters'],
          },
          addressLine2: {
            type: String,
            trim: true,
            maxlength: [200, 'Address line 2 cannot exceed 200 characters'],
          },
          city: {
            type: String,
            trim: true,
            maxlength: [100, 'City cannot exceed 100 characters'],
          },
          county: {
            type: String,
            trim: true,
            maxlength: [100, 'County cannot exceed 100 characters'],
          },
          postcode: {
            type: String,
            trim: true,
            maxlength: [10, 'Postcode cannot exceed 10 characters'],
            match: [
              /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i,
              'Please provide a valid UK postcode',
            ],
          },
          country: {
            type: String,
            trim: true,
            default: 'United Kingdom',
          },
        },
        phone: {
          type: String,
          trim: true,
        },
        hrContactName: {
          type: String,
          trim: true,
          maxlength: [100, 'HR contact name cannot exceed 100 characters'],
        },
        hrContactPhone: {
          type: String,
          trim: true,
        },
        hrContactEmail: {
          type: String,
          lowercase: true,
          trim: true,
          match: [/^\S+@\S+\.\S+$/, 'Please enter a valid HR contact email'],
        },
      },
      income: {
        gross: {
          monthly: {
            type: Number,
            min: [0, 'Monthly gross income cannot be negative'],
          },
          annual: {
            type: Number,
            min: [0, 'Annual gross income cannot be negative'],
          },
        },
        net: {
          monthly: {
            type: Number,
            min: [0, 'Monthly net income cannot be negative'],
          },
          annual: {
            type: Number,
            min: [0, 'Annual net income cannot be negative'],
          },
        },
        currency: {
          type: String,
          default: 'GBP',
          maxlength: [3, 'Currency code must be 3 characters'],
        },
        payFrequency: {
          type: String,
          enum: ['weekly', 'fortnightly', 'monthly', 'annually'],
          default: 'monthly',
        },
        verified: {
          type: Boolean,
          default: false,
        },
        verificationDate: {
          type: Date,
        },
        verificationMethod: {
          type: String,
          enum: ['payslip', 'p60', 'employment-contract', 'bank-statement', 'sa302', 'other'],
        },
        probationPeriod: {
          inProbation: {
            type: Boolean,
            default: false,
          },
          endDate: {
            type: Date,
          },
        },
      },
      benefits: {
        receives: {
          type: Boolean,
          default: false,
        },
        types: [
          {
            type: String,
            enum: [
              'universal-credit',
              'housing-benefit',
              'pension-credit',
              'job-seekers-allowance',
              'employment-support-allowance',
              'disability-living-allowance',
              'personal-independence-payment',
              'child-benefit',
              'child-tax-credit',
              'working-tax-credit',
              'other',
            ],
          },
        ],
        monthlyAmount: {
          type: Number,
          min: [0, 'Benefits amount cannot be negative'],
          default: 0,
        },
      },
    },
    previous: [
      {
        employer: {
          type: String,
          trim: true,
          maxlength: [200, 'Previous employer name cannot exceed 200 characters'],
        },
        position: {
          type: String,
          trim: true,
          maxlength: [100, 'Previous position cannot exceed 100 characters'],
        },
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        reasonForLeaving: {
          type: String,
          trim: true,
          maxlength: [200, 'Reason for leaving cannot exceed 200 characters'],
        },
        contactName: {
          type: String,
          trim: true,
          maxlength: [100, 'Contact name cannot exceed 100 characters'],
        },
        contactPhone: {
          type: String,
          trim: true,
        },
        contactEmail: {
          type: String,
          lowercase: true,
          trim: true,
        },
      },
    ],
  },

  // Financial Information (Essential UK data only)
  financialInfo: {
    bankAccount: {
      bankName: {
        type: String,
        trim: true,
        maxlength: [100, 'Bank name cannot exceed 100 characters'],
      },
      accountType: {
        type: String,
        enum: ['current', 'savings', 'business', 'student'],
      },
      sortCode: {
        type: String,
        trim: true,
        match: [/^\d{2}-\d{2}-\d{2}$/, 'Please provide a valid UK sort code (XX-XX-XX)'],
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verificationDate: {
        type: Date,
      },
    },
    guarantor: {
      required: {
        type: Boolean,
        default: false,
      },
      provided: {
        type: Boolean,
        default: false,
      },
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Guarantor name cannot exceed 100 characters'],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Guarantor relationship cannot exceed 50 characters'],
      },
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
        maxlength: [300, 'Guarantor address cannot exceed 300 characters'],
      },
      incomeVerified: {
        type: Boolean,
        default: false,
      },
    },
    affordabilityAssessment: {
      monthlyIncome: {
        type: Number,
        min: [0, 'Monthly income cannot be negative'],
      },
      monthlyExpenses: {
        type: Number,
        min: [0, 'Monthly expenses cannot be negative'],
      },
      monthlyCommitments: {
        type: Number,
        min: [0, 'Monthly commitments cannot be negative'],
        default: 0,
      },
      disposableIncome: {
        type: Number,
      },
      rentToIncomeRatio: {
        type: Number,
        min: [0, 'Rent to income ratio cannot be negative'],
        max: [100, 'Rent to income ratio cannot exceed 100%'],
      },
    },
  },

  // Rental History and Current Leases
  leases: [
    {
      property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property reference is required'],
      },
      unit: {
        type: String, // Unit number for multi-unit properties
        trim: true,
      },
      tenancyType: {
        type: String,
        enum: ['assured-shorthold', 'assured', 'regulated', 'contractual', 'periodic'],
        required: [true, 'Tenancy type is required'],
        default: 'assured-shorthold',
      },
      startDate: {
        type: Date,
        required: [true, 'Lease start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Lease end date is required'],
      },
      monthlyRent: {
        type: Number,
        required: [true, 'Monthly rent is required'],
        min: [0, 'Monthly rent cannot be negative'],
      },
      securityDeposit: {
        type: Number,
        min: [0, 'Security deposit cannot be negative'],
        default: 0,
      },
      petDeposit: {
        type: Number,
        min: [0, 'Pet deposit cannot be negative'],
        default: 0,
      },
      depositProtection: {
        scheme: {
          type: String,
          enum: ['tds', 'dps', 'mydeposits', 'not-protected'],
          default: 'not-protected',
        },
        protectionDate: {
          type: Date,
        },
        referenceNumber: {
          type: String,
          trim: true,
        },
        prescribedInfo: {
          provided: {
            type: Boolean,
            default: false,
          },
          providedDate: {
            type: Date,
          },
        },
      },
      currency: {
        type: String,
        default: 'GBP',
        maxlength: [3, 'Currency code must be 3 characters'],
      },
      rentDueDate: {
        type: Number,
        min: [1, 'Rent due date must be between 1 and 31'],
        max: [31, 'Rent due date must be between 1 and 31'],
        default: 1,
      },
      status: {
        type: String,
        enum: ['active', 'pending', 'terminated', 'expired', 'renewed'],
        default: 'pending',
      },
      leaseDocument: {
        url: {
          type: String,
        },
        uploadedAt: {
          type: Date,
        },
      },
      terminationDate: {
        type: Date,
      },
      terminationReason: {
        type: String,
        trim: true,
      },
      renewalHistory: [
        {
          renewedDate: {
            type: Date,
          },
          previousEndDate: {
            type: Date,
          },
          newEndDate: {
            type: Date,
          },
          rentIncrease: {
            type: Number,
            default: 0,
          },
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Pets Information
  pets: [
    {
      name: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        maxlength: [50, 'Pet name cannot exceed 50 characters'],
      },
      type: {
        type: String,
        required: [true, 'Pet type is required'],
        enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'],
      },
      breed: {
        type: String,
        trim: true,
        maxlength: [100, 'Pet breed cannot exceed 100 characters'],
      },
      age: {
        type: Number,
        min: [0, 'Pet age cannot be negative'],
        max: [50, 'Pet age cannot exceed 50 years'],
      },
      weight: {
        type: Number,
        min: [0, 'Pet weight cannot be negative'],
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
      color: {
        type: String,
        trim: true,
      },
      isServiceAnimal: {
        type: Boolean,
        default: false,
      },
      vaccinationStatus: {
        type: String,
        enum: ['up-to-date', 'expired', 'unknown'],
        default: 'unknown',
      },
      lastVetVisit: {
        type: Date,
      },
      specialNeeds: {
        type: String,
        trim: true,
        maxlength: [500, 'Special needs description cannot exceed 500 characters'],
      },
      photos: [
        {
          url: {
            type: String,
          },
          caption: {
            type: String,
            trim: true,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],

  // Vehicles Information
  vehicles: [
    {
      make: {
        type: String,
        trim: true,
        maxlength: [50, 'Vehicle make cannot exceed 50 characters'],
      },
      model: {
        type: String,
        trim: true,
        maxlength: [50, 'Vehicle model cannot exceed 50 characters'],
      },
      year: {
        type: Number,
        min: [1900, 'Vehicle year cannot be before 1900'],
        max: [
          new Date().getFullYear() + 2,
          'Vehicle year cannot be more than 2 years in the future',
        ],
      },
      color: {
        type: String,
        trim: true,
        maxlength: [30, 'Vehicle color cannot exceed 30 characters'],
      },
      registrationNumber: {
        type: String,
        trim: true,
        maxlength: [8, 'UK registration number cannot exceed 8 characters'],
        match: [
          /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$/,
          'Please provide a valid UK vehicle registration',
        ],
      },
      parkingSpot: {
        type: String,
        trim: true,
        maxlength: [20, 'Parking spot cannot exceed 20 characters'],
      },
    },
  ],

  // Documents
  documents: [
    {
      type: {
        type: String,
        required: [true, 'Document type is required'],
        enum: [
          'application',
          'right-to-rent',
          'passport',
          'driving-licence',
          'birth-certificate',
          'utility-bill',
          'council-tax-bill',
          'bank-statement',
          'payslip',
          'p60',
          'employment-contract',
          'benefits-letter',
          'pension-statement',
          'credit-report',
          'reference-letter',
          'previous-tenancy-agreement',
          'deposit-return-certificate',
          'character-reference',
          'guarantor-documents',
          'other',
        ],
      },
      name: {
        type: String,
        required: [true, 'Document name is required'],
        trim: true,
        maxlength: [200, 'Document name cannot exceed 200 characters'],
      },
      url: {
        type: String,
        required: [true, 'Document URL is required'],
      },
      fileSize: {
        type: Number, // in bytes
      },
      mimeType: {
        type: String,
        trim: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      expirationDate: {
        type: Date,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
      },
    },
  ],

  // Application Status and Screening
  applicationStatus: {
    status: {
      type: String,
      enum: [
        'pending',
        'under-review',
        'approved',
        'rejected',
        'waitlisted',
        'withdrawn',
        'expired',
      ],
      default: 'pending',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    reviewDate: {
      type: Date,
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  // UK Referencing and Checks
  referencing: {
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'failed'],
      default: 'not-started',
    },
    provider: {
      type: String,
      trim: true,
      maxlength: [100, 'Referencing provider cannot exceed 100 characters'],
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [50, 'Reference number cannot exceed 50 characters'],
    },
    completedDate: {
      type: Date,
    },
    outcome: {
      type: String,
      enum: ['pass', 'pass-with-conditions', 'fail', 'pending'],
    },
    conditions: {
      type: String,
      trim: true,
      maxlength: [500, 'Conditions cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Referencing notes cannot exceed 1000 characters'],
    },
  },

  // References
  references: [
    {
      type: {
        type: String,
        required: [true, 'Reference type is required'],
        enum: ['personal', 'professional', 'previous-landlord', 'employer'],
      },
      name: {
        type: String,
        required: [true, 'Reference name is required'],
        trim: true,
        maxlength: [100, 'Reference name cannot exceed 100 characters'],
      },
      relationship: {
        type: String,
        required: [true, 'Relationship is required'],
        trim: true,
        maxlength: [100, 'Relationship cannot exceed 100 characters'],
      },
      phone: {
        type: String,
        required: [true, 'Reference phone is required'],
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid reference email'],
      },
      company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters'],
      },
      yearsKnown: {
        type: Number,
        min: [0, 'Years known cannot be negative'],
      },
      contactedDate: {
        type: Date,
      },
      contactedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      response: {
        type: String,
        trim: true,
        maxlength: [1000, 'Reference response cannot exceed 1000 characters'],
      },
      recommendation: {
        type: String,
        enum: [
          'strongly-recommend',
          'recommend',
          'neutral',
          'not-recommend',
          'strongly-not-recommend',
        ],
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Reference notes cannot exceed 500 characters'],
      },
    },
  ],

  // Communication Preferences
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'text', 'app-notification'],
      default: 'email',
    },
    language: {
      type: String,
      default: 'en',
      maxlength: [5, 'Language code cannot exceed 5 characters'],
    },
    timezone: {
      type: String,
      default: 'Europe/London',
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
    maintenanceNotifications: {
      type: Boolean,
      default: true,
    },
    rentReminders: {
      type: Boolean,
      default: true,
    },
    leaseReminders: {
      type: Boolean,
      default: true,
    },
  },

  // Privacy and Security
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'landlords-only', 'private'],
      default: 'landlords-only',
    },
    allowBackgroundCheck: {
      type: Boolean,
      default: true,
    },
    allowCreditCheck: {
      type: Boolean,
      default: true,
    },
    dataRetentionConsent: {
      type: Boolean,
      required: [true, 'Data retention consent is required'],
    },
    consentDate: {
      type: Date,
      default: Date.now,
    },
  },

  // System Fields
  tenantId: {
    type: String,
    unique: true,
    index: true,
  },

  // Link to User account (if tenant has an account)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
  },

  // Landlord/Property Manager who created this tenant record
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
tenantSchema.index({ 'contactInfo.email': 1 });
tenantSchema.index({ tenantId: 1 });
tenantSchema.index({ createdBy: 1 });
tenantSchema.index({ 'leases.property': 1 });
tenantSchema.index({ 'leases.status': 1 });
tenantSchema.index({ 'applicationStatus.status': 1 });
tenantSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
tenantSchema.index({ 'addresses.current.city': 1, 'addresses.current.state': 1 });
tenantSchema.index({ isActive: 1 });

// Compound indexes
tenantSchema.index({
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  'contactInfo.email': 'text',
});

// Generate unique tenant ID before saving
tenantSchema.pre('save', function (next) {
  if (!this.tenantId) {
    // Generate tenant ID: TNT-YYYYMMDD-XXXX (TNT + date + random)
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    this.tenantId = `TNT-${date}-${random}`;
  }

  this.updatedAt = Date.now();
  this.lastActivityAt = Date.now();
  next();
});

// Pre-save middleware to update unit timestamps
tenantSchema.pre('save', function (next) {
  if (this.leases && this.leases.length > 0) {
    this.leases.forEach(lease => {
      if (lease.isModified() || lease.isNew) {
        lease.updatedAt = Date.now();
      }
    });
  }
  next();
});

// Virtual for full name
tenantSchema.virtual('fullName').get(function () {
  const { firstName, lastName, preferredName } = this.personalInfo;
  if (preferredName && preferredName !== firstName) {
    return `${preferredName} (${firstName}) ${lastName}`;
  }
  return `${firstName} ${lastName}`;
});

// Virtual for display name
tenantSchema.virtual('displayName').get(function () {
  const { firstName, preferredName } = this.personalInfo;
  return preferredName || firstName;
});

// Virtual for age
tenantSchema.virtual('age').get(function () {
  if (!this.personalInfo.dateOfBirth) {
    return null;
  }
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for current lease
tenantSchema.virtual('currentLease').get(function () {
  if (!this.leases || this.leases.length === 0) {
    return null;
  }
  return this.leases.find(lease => lease.status === 'active') || null;
});

// Virtual for primary phone with formatted number
tenantSchema.virtual('primaryPhoneFormatted').get(function () {
  const { number, countryCode } = this.contactInfo.phone.primary;
  if (!number) {
    return null;
  }
  return `${countryCode} ${number}`;
});

// Virtual for current address formatted
tenantSchema.virtual('currentAddressFormatted').get(function () {
  const addr = this.addresses.current;
  if (!addr.addressLine1) {
    return 'No current address';
  }

  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    addr.city,
    addr.county,
    addr.postcode,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for affordability ratio (UK standard)
tenantSchema.virtual('affordabilityRatio').get(function () {
  const assessment = this.financialInfo.affordabilityAssessment;
  if (!assessment.monthlyIncome || assessment.monthlyIncome === 0) {
    return null;
  }
  const totalExpenses = (assessment.monthlyExpenses || 0) + (assessment.monthlyCommitments || 0);
  return (
    Math.round(
      ((assessment.monthlyIncome - totalExpenses) / assessment.monthlyIncome) * 100 * 100,
    ) / 100
  );
});

// Virtual for application age in days
tenantSchema.virtual('applicationAgeInDays').get(function () {
  if (!this.applicationStatus.applicationDate) {
    return null;
  }
  const today = new Date();
  const appDate = new Date(this.applicationStatus.applicationDate);
  const diffTime = Math.abs(today - appDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
tenantSchema.set('toJSON', { virtuals: true });
tenantSchema.set('toObject', { virtuals: true });

// Static method to find tenants by property
tenantSchema.statics.findByProperty = function (propertyId) {
  return this.find({ 'leases.property': propertyId });
};

// Static method to find current tenants
tenantSchema.statics.findCurrentTenants = function () {
  return this.find({ 'leases.status': 'active' });
};

// Instance method to add new lease
tenantSchema.methods.addLease = function (leaseData) {
  this.leases.push(leaseData);
  return this.save();
};

// Instance method to update lease status
tenantSchema.methods.updateLeaseStatus = function (leaseId, status) {
  const lease = this.leases.id(leaseId);
  if (lease) {
    lease.status = status;
    lease.updatedAt = Date.now();
    return this.save();
  }
  throw new Error('Lease not found');
};

// Instance method to check if tenant qualifies based on income (UK standards)
tenantSchema.methods.checkIncomeQualification = function (monthlyRent) {
  const grossIncome = this.employment.current.income.gross.monthly;
  const netIncome = this.employment.current.income.net.monthly;

  if (!grossIncome && !netIncome) {
    return { qualified: false, reason: 'No income information provided' };
  }

  const income = grossIncome || netIncome;
  const multiplier = grossIncome ? 2.5 : 3.0; // More lenient for gross income

  if (income >= monthlyRent * multiplier) {
    return { qualified: true, ratio: Math.round((income / monthlyRent) * 100) / 100 };
  }

  return {
    qualified: false,
    reason: `Income (£${income}) is less than ${multiplier}x rent (£${monthlyRent * multiplier})`,
    ratio: Math.round((income / monthlyRent) * 100) / 100,
  };
};

// Instance method to check affordability
tenantSchema.methods.checkAffordability = function (monthlyRent) {
  const assessment = this.financialInfo?.affordabilityAssessment;

  // Use affordability assessment if available, otherwise fall back to employment income
  let monthlyIncome;
  let monthlyExpenses = 0;
  let monthlyCommitments = 0;

  if (assessment?.monthlyIncome) {
    monthlyIncome = assessment.monthlyIncome;
    monthlyExpenses = assessment.monthlyExpenses || 0;
    monthlyCommitments = assessment.monthlyCommitments || 0;
  } else if (this.employment?.current?.income?.gross?.monthly) {
    // Fall back to employment income
    monthlyIncome = this.employment.current.income.gross.monthly;
    // Use default UK assumptions if no specific assessment
    monthlyExpenses = assessment?.monthlyExpenses || 0;
    monthlyCommitments = assessment?.monthlyCommitments || 0;
  } else {
    return { affordable: false, reason: 'No income data for affordability assessment' };
  }

  const totalCommitments = monthlyExpenses + monthlyCommitments;
  const disposableIncome = monthlyIncome - totalCommitments;

  if (disposableIncome >= monthlyRent) {
    return {
      affordable: true,
      disposableAfterRent: disposableIncome - monthlyRent,
      affordabilityRatio: Math.round((disposableIncome / monthlyRent) * 100) / 100,
    };
  }

  return {
    affordable: false,
    reason: `Insufficient disposable income (£${disposableIncome}) for rent (£${monthlyRent})`,
    shortfall: monthlyRent - disposableIncome,
  };
};

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
